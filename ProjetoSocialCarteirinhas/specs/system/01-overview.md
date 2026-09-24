# SYSTEM OVERVIEW
Version: 1.0
Status: Active
Last Updated: 2026-02-20

---

## 1. System Identity

Name: Projeto Social Carteirinhas

Projeto Social Carteirinhas is a web-based system designed to generate student ID cards automatically from a spreadsheet exported from Google Sheets. The system processes structured student data and generates printable ID cards following a predefined visual template.

The system is intended for internal use by authorized staff members responsible for generating and managing student ID cards.

Target users:
- Administrative employees responsible for generating ID cards.
- Project coordinators supervising the issuance process.

---

## 2. Business Objectives

Primary goal:
- Automate the generation of student ID cards from structured spreadsheet data.

Secondary goals:
- Reduce manual design work.
- Standardize the ID card layout and information.
- Minimize human errors during data transcription.
- Reduce processing time per batch of students.

Success metrics:
- Time to generate a batch of 100 ID cards under 5 minutes.
- Zero manual editing required after generation in at least 95% of cases.
- Error rate in generated data below 1%.
- Ability to process at least 1,000 students per batch.

---

## 3. Scope Definition

### In Scope
- Upload of spreadsheet files exported from Google Sheets (CSV or XLSX).
- Validation of required student fields.
- Generation of printable student ID cards (PDF format).
- Standardized visual template for ID cards.
- Batch generation of multiple ID cards.
- Basic error reporting for invalid rows.
- Download of generated files.

### Out of Scope
- Direct integration with Google Sheets API (initial version).
- Student database management system.
- User registration or student self-service portal.
- Payment processing.
- Advanced card customization per student.
- Mobile application.
- No cloud storage

---

## 4. Core Value Proposition

This system eliminates manual graphic editing and repetitive data entry when creating student ID cards.

Instead of manually copying student information into design software, employees can upload a structured spreadsheet and automatically generate standardized ID cards in bulk.

The system exists to improve operational efficiency, reduce human error, and ensure visual consistency across all issued student ID cards.

---

## 5. High-Level Capabilities

- Spreadsheet ingestion and validation.
- Automated ID card generation based on predefined layout.
- Batch PDF generation and download.
- Validation and error reporting per student record.
- Template-based card design with fixed layout structure.

---

## 6. System Context

External systems:
- Google Sheets (data source export).
- Local printing infrastructure (PDF printing).
- Python with libs that can detect faces in images and crop them to a specific size.

Users interact via:
- Web interface (primary interaction).
- File upload (CSV/XLSX).
- File download (PDF output).