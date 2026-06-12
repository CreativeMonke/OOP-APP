use serde::Serialize;
use std::io::Read;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tempfile::tempdir;

#[derive(Serialize, Debug)]
pub struct RunResult {
    pub compiled: bool,
    pub passed: bool,
    pub stdout: String,
    pub stderr: String,
}

pub fn run_code(user_code: &str, test_harness: &str) -> RunResult {
    if !clang_available() {
        return RunResult {
            compiled: false,
            passed: false,
            stdout: String::new(),
            stderr: "clang++ not found.\nInstall Xcode Command Line Tools:\n  xcode-select --install\nThen restart OOP Academy.".to_string(),
        };
    }

    let dir = match tempdir() {
        Ok(d) => d,
        Err(e) => return error_result(format!("Cannot create temp dir: {e}")),
    };

    let src_path: PathBuf = dir.path().join("solution.cpp");
    let bin_path: PathBuf = dir.path().join("solution");

    let full_source = format!("{user_code}\n\n{test_harness}");
    if let Err(e) = std::fs::write(&src_path, &full_source) {
        return error_result(format!("Cannot write source: {e}"));
    }

    // Compile — 10 second limit
    let compile = timed_run(
        Command::new("clang++")
            .arg("-std=c++17")
            .arg("-O1")
            .arg("-Wall")
            .arg("-o")
            .arg(&bin_path)
            .arg(&src_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped()),
        Duration::from_secs(10),
    );

    match compile {
        Err(msg) => RunResult {
            compiled: false,
            passed: false,
            stdout: String::new(),
            stderr: format!("Compile timeout: {msg}"),
        },
        Ok((ok, _cout, cerr)) if !ok => RunResult {
            compiled: false,
            passed: false,
            stdout: String::new(),
            stderr: cerr,
        },
        Ok(_) => {
            // Run — 5 second limit
            let exec = timed_run(
                Command::new(&bin_path)
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped()),
                Duration::from_secs(5),
            );
            match exec {
                Err(msg) => RunResult {
                    compiled: true,
                    passed: false,
                    stdout: String::new(),
                    stderr: format!("Runtime: {msg}"),
                },
                Ok((ok, out, err)) => RunResult {
                    compiled: true,
                    passed: ok && out.contains("ALL TESTS PASSED"),
                    stdout: out,
                    stderr: err,
                },
            }
        }
    }
}

fn clang_available() -> bool {
    Command::new("which")
        .arg("clang++")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn error_result(msg: String) -> RunResult {
    RunResult {
        compiled: false,
        passed: false,
        stdout: String::new(),
        stderr: msg,
    }
}

fn timed_run(cmd: &mut Command, limit: Duration) -> Result<(bool, String, String), String> {
    let mut child = cmd.spawn().map_err(|e| e.to_string())?;

    let stdout_pipe = child.stdout.take();
    let stderr_pipe = child.stderr.take();

    let out_buf = Arc::new(Mutex::new(Vec::<u8>::new()));
    let err_buf = Arc::new(Mutex::new(Vec::<u8>::new()));

    let out_clone = Arc::clone(&out_buf);
    let err_clone = Arc::clone(&err_buf);

    let out_thread = std::thread::spawn(move || {
        if let Some(mut p) = stdout_pipe {
            let mut v = Vec::new();
            p.read_to_end(&mut v).ok();
            *out_clone.lock().unwrap() = v;
        }
    });
    let err_thread = std::thread::spawn(move || {
        if let Some(mut p) = stderr_pipe {
            let mut v = Vec::new();
            p.read_to_end(&mut v).ok();
            *err_clone.lock().unwrap() = v;
        }
    });

    let start = Instant::now();
    let exit_status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) => {
                if start.elapsed() >= limit {
                    child.kill().ok();
                    out_thread.join().ok();
                    err_thread.join().ok();
                    return Err("Timed out".to_string());
                }
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(e) => {
                child.kill().ok();
                return Err(e.to_string());
            }
        }
    };

    out_thread.join().ok();
    err_thread.join().ok();

    let stdout = String::from_utf8_lossy(&out_buf.lock().unwrap()).to_string();
    let stderr = String::from_utf8_lossy(&err_buf.lock().unwrap()).to_string();

    Ok((exit_status.success(), stdout, stderr))
}
