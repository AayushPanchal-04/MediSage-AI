from fpdf import FPDF
import os

class TechnicalReport(FPDF):
    def header(self):
        self.set_font('Courier', 'B', 14)
        self.set_text_color(20, 20, 20)
        self.cell(0, 10, 'PROVIDER-TO-PROVIDER CLINICAL TRANSFER DATA [L3-ISO]', 0, 1, 'L')
        self.set_font('Courier', '', 8)
        self.cell(0, 5, 'FAC_ID: 99-XJ-8812 | SRC: HL7-V2.5.1 | ROUTING: 0xFFA192', 0, 1, 'L')
        self.ln(5)
        self.set_draw_color(50, 50, 50)
        self.line(10, 25, 200, 25)

    def footer(self):
        self.set_y(-15)
        self.set_font('Courier', 'I', 7)
        self.cell(0, 10, f'PAGE_{self.page_no()}_OF_4 | SYS_ID_001928374', 0, 0, 'R')

    def technical_section(self, title):
        self.set_font('Courier', 'B', 11)
        self.set_fill_color(200, 200, 200)
        self.cell(0, 8, f' >> {title} <<', 1, 1, 'L', True)
        self.ln(2)

def generate_technical_pdf():
    pdf = TechnicalReport()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font('Courier', '', 9)
    
    # --- PAGE 1: HL7 & ICD-10 DIAGNOSTICS ---
    pdf.add_page()
    pdf.ln(10)
    
    pdf.technical_section('ENCOUNTER_METADATA')
    pdf.multi_cell(0, 5, 'UUID: 550e8400-e29b-41d4-a716-446655440000\nENTITY_CLASS: CLIN_ENC_PRO\nAUTHENTICATION_TOKEN: 0x8892BA190\nPROTOCOL: HL7_v2.5.1_STANDARD\nENCRYPTION: AES-256-GCM\nLOC_STAMP: 28.6139-N_77.2090-E')
    
    pdf.ln(5)
    pdf.technical_section('ICD-10-CM_DIAGNOSTIC_CODING_STACK')
    
    codes = [
        ['E11.9', 'PRIMARY', 'Type 2 Diabetes Mellitus without complications'],
        ['I10', 'SECONDARY', 'Essential (primary) hypertension'],
        ['E78.5', 'SECONDARY', 'Hyperlipidemia, unspecified'],
        ['E03.9', 'CO-MORBID', 'Hypothyroidism, unspecified'],
        ['E66.9', 'PHYS_ATTR', 'Obesity, unspecified'],
        ['E55.9', 'DEFICIENCY', 'Vitamin D deficiency, unspecified'],
        ['G47.33', 'DIFFERENTIAL', 'Obstructive Sleep Apnea (Adult)'],
        ['M54.50', 'SYMPTOMATIC', 'Low back pain, unspecified'],
        ['Z71.3', 'THERAPY', 'Dietary counseling and surveillance']
    ]
    
    pdf.set_font('Courier', 'B', 9)
    pdf.cell(30, 8, 'ICD-10 CODE', 1)
    pdf.cell(40, 8, 'CLASS', 1)
    pdf.cell(110, 8, 'SYSTEM DESCRIPTION', 1, 1)
    
    pdf.set_font('Courier', '', 8)
    for row in codes:
        pdf.cell(30, 7, row[0], 1)
        pdf.cell(40, 7, row[1], 1)
        pdf.cell(110, 7, row[2], 1, 1)

    # --- PAGE 2: LOINC-MAPPED LABORATORY STACK ---
    pdf.add_page()
    pdf.ln(5)
    pdf.technical_section('LABORATORY_LOINC_ONTOLOGY_MAPPING')
    
    lab_data = [
        ['4548-4', 'Hemoglobin A1c/Hemoglobin.total', '6.4%', '%', 'M_ELEVATED'],
        ['2093-3', 'Cholesterol [Mass/Vol] in Serum/Pl', '270', 'mg/dL', 'C_HIGH'],
        ['2085-9', 'HDL Cholesterol [Mass/Vol]', '38', 'mg/dL', 'M_LOW'],
        ['13457-7', 'LDL Cholesterol [Mass/Vol]', '185', 'mg/dL', 'C_HIGH'],
        ['2571-8', 'Triglyceride [Mass/Vol]', '210', 'mg/dL', 'B_HIGH'],
        ['11580-8', 'TSH [Presence/Vol] in Serum/Pl', '5.8', 'uIU/mL', 'B_ELEVATED'],
        ['20275-4', 'Vitamin B12 [Mass/Vol] Serum/Pl', '180', 'pg/mL', 'C_DEFICIENT'],
        ['62292-8', 'Vitamin D, 25-Hydroxy [Mass/Vol]', '15', 'ng/mL', 'C_DEFICIENT'],
        ['2823-3', 'Potassium [Moles/Vol] Serum/Pl', '4.2', 'mmol/L', 'NORMAL'],
        ['2160-0', 'Creatinine [Mass/Vol] Serum/Pl', '0.9', 'mg/dL', 'NORMAL'],
        ['30522-7', 'CRP, High Sensitivity [Mass/Vol]', '8.5', 'mg/L', 'M_ELEVATED']
    ]
    
    pdf.set_font('Courier', 'B', 8)
    pdf.cell(25, 8, 'LOINC_ID', 1)
    pdf.cell(90, 8, 'COMPONENT_DESCRIPTION', 1)
    pdf.cell(20, 8, 'VALUE', 1)
    pdf.cell(20, 8, 'UNIT', 1)
    pdf.cell(35, 8, 'SYS_FLAG', 1, 1)
    
    pdf.set_font('Courier', '', 8)
    for row in lab_data:
        pdf.cell(25, 7, row[0], 1)
        pdf.cell(90, 7, row[1], 1)
        pdf.cell(20, 7, row[2], 1)
        pdf.cell(20, 7, row[3], 1)
        pdf.cell(35, 7, row[4], 1, 1)

    # --- PAGE 3: CARDIAC & MORPHOLOGICAL DATA ---
    pdf.add_page()
    pdf.ln(5)
    pdf.technical_section('ECG_PHYSIOLOGICAL_WAVEFORM_METRICS')
    pdf.multi_cell(0, 5, 'RATING: SINUS_RHYTHM_WITH_LVH_INDICATORS\nVENT_RATE: 88 bpm\nPR_INTERVAL: 162 ms\nQRS_DURATION: 110 ms\nQT_QTC_INTERVAL: 412/465 ms (Elevated QTc)\nP_R_T_AXES: 54 / -12 / 62 degrees\nST_MORPHOLOGY: Non-specific ST wave changes in V5, V6\nINTERPRETIVE_CODE: 0x992B-HYP')
    
    pdf.ln(10)
    pdf.technical_section('RADIOLOGICAL_MORPHOLOGY_REPORT [DCM]')
    pdf.multi_cell(0, 5, 'IMAGE_UID: 1.2.840.113619.2.135.2025\nANATOMICAL_TARGET: THORACIC_CAVITY_PA_LATERAL\nBONE_WINDOW: No cortical disruption or pathological fractures detected.\nSOFT_TISSUE: Mediastinal silhouette showing increase in CTL (Cardio-Thoracic Limit) > 0.55\nPARENCHYMA: Bronchovascular prominence bilaterally. No focal opacities.\nBI-RADS_EQUIVALENT_SCORING: NA\nRAD_SIGNATURE: MDX_AUTO_RAD_v4.2')

    # --- PAGE 4: PHARMACOLOGICAL & METADATA ---
    pdf.add_page()
    pdf.ln(5)
    pdf.technical_section('PHARMACOLOGICAL_REXS_NOMENCLATURE')
    
    meds = [
        ['RXN_4053', 'Telmisartan 40mg', 'ORAL_TAB', '1_QD', '0x221A'],
        ['RXN_1531', 'Atorvastatin 10mg', 'ORAL_TAB', '1_QHS', '0x998B'],
        ['RXN_8812', 'Levothyroxine 25mcg', 'ORAL_TAB', '1_QD_AM', '0xCC01'],
        ['RXN_9921', 'Cyanocobalamin 1000mcg', 'ORAL_TAB', '1_QD', '0xEE42']
    ]
    
    pdf.set_font('Courier', 'B', 8)
    pdf.cell(25, 8, 'RXN_ID', 1)
    pdf.cell(60, 8, 'GENERIC_NAME', 1)
    pdf.cell(30, 8, 'DOSAGE_FORM', 1)
    pdf.cell(40, 8, 'FREQUENCY', 1)
    pdf.cell(35, 8, 'DISP_CODE', 1, 1)
    
    pdf.set_font('Courier', '', 8)
    for row in meds:
        pdf.cell(25, 7, row[0], 1)
        pdf.cell(60, 7, row[1], 1)
        pdf.cell(30, 7, row[2], 1)
        pdf.cell(40, 7, row[3], 1)
        pdf.cell(35, 7, row[4], 1, 1)

    pdf.ln(20)
    pdf.technical_section('EMBEDDED_SYSTEM_METADATA_EXTRACT')
    pdf.set_font('Courier', '', 7)
    pdf.set_text_color(180, 180, 180)
    pdf.multi_cell(0, 4, '{"metadata": {"version": "3.1.2", "schema": "clin-v2", "audit": {"id": "AUDIT-00992", "ts": "2026-04-01T01:21:09"}, "ai_flags": ["ANOMALY_DETECTED", "MULTI_SYSTEM_ISSUE"], "priority": 1, "integration_key": "992B-001-XJ-A1"}}')

    output_path = os.path.join('uploads', 'System_Technical_Report_v4.pdf')
    pdf.output(output_path)
    print(f"Generated: {output_path}")

# Run the generator
generate_technical_pdf()
