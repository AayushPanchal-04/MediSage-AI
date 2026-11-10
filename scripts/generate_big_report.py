from fpdf import FPDF
import os

class ComprehensiveReport(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(40, 70, 150)
        self.cell(0, 10, 'ADVANCED CLINICAL DIAGNOSTIC CENTER', 0, 1, 'C')
        self.set_font('Helvetica', 'I', 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, 'Specialized in Multi-System Health Evaluation', 0, 1, 'C')
        self.ln(5)
        self.set_draw_color(40, 70, 150)
        self.line(10, 30, 200, 30)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Page {self.page_no()} | Confidential Patient Record | Generated on 01-Apr-2026', 0, 0, 'C')

    def section_header(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_fill_color(230, 240, 255)
        self.set_text_color(40, 70, 150)
        self.cell(0, 10, f' {title}', 0, 1, 'L', True)
        self.ln(3)

def generate_big_report():
    pdf = ComprehensiveReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # --- PAGE 1: DEMOGRAPHICS & VITALS ---
    pdf.add_page()
    pdf.ln(10)
    
    # Patient Table
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(40, 10, 'Full Name:', 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(60, 10, 'Vikram Singhania', 0)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(40, 10, 'Case ID:', 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(40, 10, 'MED-99-ALPHA', 0, 1)
    
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(40, 10, 'Age / Gender:', 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(60, 10, '48 Years / Male', 0)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(40, 10, 'Date of Visit:', 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(40, 10, '28-Mar-2026', 0, 1)
    
    pdf.ln(10)
    pdf.section_header('PAST MEDICAL HISTORY (PMH)')
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(0, 0, 0)
    pdf.multi_cell(0, 8, 'Patient has a history of mild asthma in childhood. Family history reveals a significant predisposition to Type 2 Diabetes and Hypertension (Paternal). Current lifestyle is characterized as sedentary with a high-calcium, high-sodium diet.')
    
    pdf.ln(5)
    pdf.section_header('PHYSICAL EXAMINATION & VITALS')
    
    # Vitals table-like layout
    data = [
        ['Blood Pressure', '150/95 mmHg', 'High (Stage 2)'],
        ['Heart Rate', '88 bpm', 'Normal'],
        ['Respiratory Rate', '22 breaths/min', 'Slightly Elevated'],
        ['Temperature', '98.6 F', 'Normal'],
        ['Weight / Height', '92.5 kg / 172 cm', 'BMI: 31.2 (Obese Cluster)'],
        ['Oxygen Saturation', '96% (Room Air)', 'Normal']
    ]
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(50, 10, 'Parameter', 1)
    pdf.cell(60, 10, 'Value', 1)
    pdf.cell(60, 10, 'Clinical Note', 1, 1)
    
    pdf.set_font('Helvetica', '', 10)
    for row in data:
        pdf.cell(50, 10, row[0], 1)
        pdf.cell(60, 10, row[1], 1)
        pdf.cell(60, 10, row[2], 1, 1)
    
    # --- PAGE 2: LABORATORY ANALYSIS ---
    pdf.add_page()
    pdf.ln(5)
    pdf.section_header('COMPREHENSIVE BIOCHEMICAL ANALYSIS')
    
    pdf.set_font('Helvetica', 'I', 9)
    pdf.cell(0, 10, '*Ref range for adult males provided for comparison', 0, 1)
    
    lab_data = [
        ['HbA1c (Glycated Hb)', '6.4%', 'Elevated (Pre-Diabetic)'],
        ['Fasting Plasma Glucose', '118 mg/dL', 'Impaired Fasting Glucose'],
        ['Total Cholesterol', '270 mg/dL', 'High Risk (>240)'],
        ['LDL (Bad) Chol', '185 mg/dL', 'Critical Elevation'],
        ['HDL (Good) Chol', '38 mg/dL', 'Low Risk (<40)'],
        ['Triglycerides', '210 mg/dL', 'Borderline High'],
        ['TSH (Ultra-sensitive)', '5.8 uIU/mL', 'Mild Hypothyroidism'],
        ['Serum Vitamin B12', '180 pg/mL', 'Deficient (<200)'],
        ['Serum Vitamin D3', '15 ng/mL', 'Deficient (<20)']
    ]
    
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(70, 10, 'Test Name', 1, 0, 'C', True)
    pdf.cell(40, 10, 'Result', 1, 0, 'C', True)
    pdf.cell(70, 10, 'Interpretation', 1, 1, 'C', True)
    
    pdf.set_font('Helvetica', '', 10)
    for row in lab_data:
        pdf.cell(70, 10, row[0], 1)
        pdf.cell(40, 10, row[1], 1, 0, 'C')
        pdf.set_text_color(200, 0, 0) if 'Elevated' in row[2] or 'Critical' in row[2] or 'Deficient' in row[2] else pdf.set_text_color(0,0,0)
        pdf.cell(70, 10, row[2], 1, 1)
        pdf.set_text_color(0,0,0)

    # --- PAGE 3: IMAGING & SUMMARY ---
    pdf.add_page()
    pdf.ln(5)
    pdf.section_header('RADIOLOGICAL FINDINGS (CHEST X-RAY PA VIEW)')
    pdf.set_font('Helvetica', '', 11)
    pdf.multi_cell(0, 8, 'OBSERVATIONS: Initial assessment shows mild enlargement of the cardiac silhouette (cardiomegaly). The lung fields appear mostly clear, though increased bronchovascular markings are noted bilaterally in the lower hila. No active consolidation or pleural effusion detected.')
    
    pdf.ln(5)
    pdf.section_header('CLINICAL ASSESSMENT & DIAGNOSIS')
    
    pdf.set_font('Helvetica', 'B', 11)
    issues = [
        '1. Metabolic Syndrome (Dyslipidemia + Pre-diabetes)',
        '2. Stage 2 Essential Hypertension',
        '3. Subclinical Hypothyroidism',
        '4. Nutritional Deficiency (B12 and D3)',
        '5. BMI-related Sleep Apnea risk identified'
    ]
    for issue in issues:
        pdf.cell(0, 10, issue, 0, 1)
    
    pdf.ln(5)
    pdf.section_header('INTEGRATED TREATMENT PLAN')
    pdf.set_font('Helvetica', '', 11)
    pdf.multi_cell(0, 8, 'A multi-modal approach is required. Start Telmisartan 40mg (OD) for BP control and Atorvastatin 10mg (HS) for lipids. Levothyroxine 25mcg to be initiated following endocrinology review. High-dose oral Vitamin B12 and D3 supplementation prescribed for 12 weeks. Patient advised to reduce carbohydrate intake and initiate a 30-min brisk walk daily.')
    
    pdf.ln(20)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(0, 10, 'Electronic Signature:', 0, 1, 'R')
    pdf.set_font('Helvetica', 'I', 11)
    pdf.cell(0, 10, 'Dr. Arnab Chatterjee, Senior MD, Consultant Physician', 0, 1, 'R')

    output_path = os.path.join('uploads', 'Comprehensive_Health_Report_2026.pdf')
    pdf.output(output_path)
    print(f"Generated: {output_path}")

# Run the generator
generate_big_report()
