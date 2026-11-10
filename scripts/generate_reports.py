from fpdf import FPDF
import os

class MedicalReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'CITY GENERAL HOSPITAL - CLINICAL REPORT', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 10, 'Department of Diagnostic Medicine', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_report(filename, date, issues, notes):
    pdf = MedicalReport()
    pdf.add_page()
    
    # Patient Info Header
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(40, 10, 'Patient Name:', 0)
    pdf.set_font('Arial', '', 11)
    pdf.cell(60, 10, 'Rahul Sharma', 0)
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(30, 10, 'Date:', 0)
    pdf.set_font('Arial', '', 11)
    pdf.cell(40, 10, date, 0, 1)
    
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(40, 10, 'Patient ID:', 0)
    pdf.set_font('Arial', '', 11)
    pdf.cell(60, 10, 'P-2024-8891', 0)
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(30, 10, 'Gender/Age:', 0)
    pdf.set_font('Arial', '', 11)
    pdf.cell(40, 10, 'Male / 42y', 0, 1)
    
    pdf.ln(10)
    
    # Clinical Indications
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, ' CLINICAL PARAMETERS & FINDINGS', 0, 1, 'L', True)
    pdf.ln(5)
    
    pdf.set_font('Arial', '', 11)
    for issue in issues:
        pdf.multi_cell(pdf.epw, 8, f'- {issue}')
    
    pdf.ln(10)
    
    # AI/Clinical Notes
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, ' PHYSICIAN RECOMMENDATIONS', 0, 1, 'L', True)
    pdf.ln(5)
    
    pdf.set_font('Arial', '', 11)
    pdf.multi_cell(pdf.epw, 10, notes)
    
    pdf.ln(20)
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 10, 'Electronically Verified by: Dr. Vikram Mehta, MD', 0, 1, 'R')

    output_path = os.path.join('uploads', filename)
    pdf.output(output_path)
    print(f"Generated: {output_path}")

# Ensure uploads directory exists
if not os.path.exists('uploads'):
    os.makedirs('uploads')

# Report 1 (Jan)
create_report(
    'Report_Jan_2026_Metabolic.pdf', 
    '15-Jan-2026',
    [
        'Blood Pressure: 145/92 mmHg (Hypertensive Stage 1)',
        'HbA1c: 6.2% (Pre-diabetic zone)',
        'BMI: 29.5 (Overweight criteria met)',
        'Fasting Glucose: 112 mg/dL (Elevated)'
    ],
    'Patient shows early signs of metabolic syndrome. Lifestyle modifications recommended including diet and regular exercise. Monitor salt intake.'
)

# Report 2 (Feb)
create_report(
    'Report_Feb_2026_Lipid.pdf', 
    '20-Feb-2026',
    [
        'Total Cholesterol: 245 mg/dL (High Risk)',
        'LDL (Bad) Cholesterol: 165 mg/dL (Elevated)',
        'Vitamin D (25-OH): 18 ng/mL (Deficient)',
        'ALT (SGPT): 55 U/L (Mild Elevation - Liver Health)'
    ],
    'Clinical findings suggest Hyperlipidemia and Vit D deficiency. Recommend Vit D3 supplementation 60k IU weekly for 8 weeks. Low fat diet advised.'
)

# Report 3 (Mar)
create_report(
    'Report_Mar_2026_Respiratory.pdf', 
    '25-Mar-2026',
    [
        'CRP (High Sensitivity): 8.5 mg/L (Active Inflammation)',
        'Pulse Oximetry (SpO2): 94% on room air',
        'Lung Sounds: Expiratory wheeze noted in lower lobes',
        'Serum IgE: 450 IU/mL (Allergic predisposition)'
    ],
    'Symptoms consistent with mild persistent asthma or seasonal exacerbation. Prescribed FEV1 test. Start Montelukast 10mg once daily.'
)
