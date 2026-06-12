//! Dev utility: parse the course PDFs once and freeze the result into
//! src/data/courses.json so the shipped app doesn't need the PDFs at all.
//! Run with: cargo run --bin dump_courses

use oop_academy_lib::pdf_parser::parse_pdf;
use std::path::PathBuf;

fn main() {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let courses: Vec<_> = (1..=12)
        .map(|i| parse_pdf(&base.join(format!("Course-{i}.pdf")), i))
        .collect();

    let with_content = courses.iter().filter(|c| !c.concepts.is_empty()).count();
    let json = serde_json::to_string_pretty(&courses).expect("serialize courses");
    let out = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/data/courses.json");
    std::fs::write(&out, json).expect("write courses.json");
    eprintln!(
        "wrote {} ({} of {} courses have concepts)",
        out.display(),
        with_content,
        courses.len()
    );
}
