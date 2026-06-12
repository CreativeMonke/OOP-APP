use regex::Regex;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize, Clone, Debug)]
pub struct CodeExample {
    pub title: String,
    pub code: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct Concept {
    pub name: String,
    pub explanation: String,
    pub code_examples: Vec<CodeExample>,
}

#[derive(Serialize, Clone, Debug)]
pub struct Course {
    pub id: usize,
    pub title: String,
    pub concepts: Vec<Concept>,
}

pub fn parse_pdf(path: &PathBuf, id: usize) -> Course {
    let text = match pdf_extract::extract_text(path) {
        Ok(t) => t,
        Err(_) => {
            return Course {
                id,
                title: format!("Course {id}"),
                concepts: vec![],
            }
        }
    };

    let title = extract_title(&text, id);
    let concepts = parse_concepts(&text);

    Course { id, title, concepts }
}

fn extract_title(text: &str, id: usize) -> String {
    let lines: Vec<&str> = text.lines().collect();
    for line in lines.iter().take(20) {
        let trimmed = line.trim();
        if trimmed.len() > 5 && trimmed.len() < 100 && !trimmed.is_empty() {
            let cleaned = trimmed
                .trim_start_matches(|c: char| !c.is_alphabetic())
                .to_string();
            if !cleaned.is_empty() {
                return cleaned;
            }
        }
    }
    format!("Course {id}")
}

fn parse_concepts(text: &str) -> Vec<Concept> {
    let mut concepts = Vec::new();

    // Split text into sections based on heading-like patterns
    let heading_re =
        Regex::new(r"(?m)^[\s]*([A-Z][A-Za-z0-9\s&\-/\+\(\)]{5,60})\s*$").unwrap_or_else(|_| {
            Regex::new(r"NOMATCH").unwrap()
        });

    let code_re =
        Regex::new(r"(?s)(?:App\.c|#include\s*<|struct\s+[A-Za-z_]|class\s+[A-Za-z_]).*?(?:\n\s*|\n\s*==|\z)").unwrap_or_else(|_| {
            Regex::new(r"NOMATCH").unwrap()
        });

    let sections: Vec<&str> = heading_re.split(text).collect();
    let headings: Vec<&str> = heading_re
        .find_iter(text)
        .map(|m| m.as_str().trim())
        .collect();

    for (i, section) in sections.iter().enumerate().skip(1) {
        if section.trim().is_empty() || section.len() < 30 {
            continue;
        }

        let name = headings
            .get(i - 1)
            .copied()
            .unwrap_or("Concept")
            .to_string();

        let explanation = extract_explanation(section);

        let mut code_examples = Vec::new();
        for (j, cap) in code_re.find_iter(section).enumerate().take(3) {
            let code_text = cap.as_str().trim().to_string();
            if code_text.len() > 20 {
                code_examples.push(CodeExample {
                    title: format!("Example {}", j + 1),
                    code: code_text,
                });
            }
        }

        if !name.is_empty() && !explanation.is_empty() {
            concepts.push(Concept {
                name,
                explanation,
                code_examples,
            });
        }

        if concepts.len() >= 10 {
            break;
        }
    }

    concepts
}

fn extract_explanation(section: &str) -> String {
    let lines: Vec<&str> = section
        .lines()
        .filter(|l| {
            let t = l.trim();
            !t.is_empty()
                && !t.starts_with('#')
                && !t.starts_with("//")
                && !t.starts_with("int ")
                && !t.starts_with("class ")
                && t.len() > 10
        })
        .take(8)
        .collect();
    lines.join(" ").trim().to_string()
}
