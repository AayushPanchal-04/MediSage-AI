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

def generate_technical_pdf(filename, icd_codes, lab_data, imaging_text, meds_data, metadata_json):
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
    pdf.set_font('Courier', 'B', 9)
    pdf.cell(30, 8, 'ICD-10 CODE', 1)
    pdf.cell(40, 8, 'CLASS', 1)
    pdf.cell(110, 8, 'SYSTEM DESCRIPTION', 1, 1)
    pdf.set_font('Courier', '', 8)
    for row in icd_codes:
        pdf.cell(30, 7, row[0], 1)
        pdf.cell(40, 7, row[1], 1)
        pdf.cell(110, 7, row[2], 1, 1)

    # --- PAGE 2: LOINC-MAPPED LABORATORY STACK ---
    pdf.add_page()
    pdf.ln(5)
    pdf.technical_section('LABORATORY_LOINC_ONTOLOGY_MAPPING')
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

    # --- PAGE 3: IMAGING & MORPHOLOGICAL DATA ---
    pdf.add_page()
    pdf.ln(5)
    pdf.technical_section('DIAGNOSTIC_IMAGING_METRICS')
    pdf.multi_cell(0, 5, imaging_text)

    # --- PAGE 4: PHARMACOLOGICAL & METADATA ---
    pdf.add_page()
    pdf.ln(5)
    pdf.technical_section('PHARMACOLOGICAL_REXS_NOMENCLATURE')
    pdf.set_font('Courier', 'B', 8)
    pdf.cell(25, 8, 'RXN_ID', 1)
    pdf.cell(60, 8, 'GENERIC_NAME', 1)
    pdf.cell(30, 8, 'DOSAGE_FORM', 1)
    pdf.cell(40, 8, 'FREQUENCY', 1)
    pdf.cell(35, 8, 'DISP_CODE', 1, 1)
    pdf.set_font('Courier', '', 8)
    for row in meds_data:
        pdf.cell(25, 7, row[0], 1)
        pdf.cell(60, 7, row[1], 1)
        pdf.cell(30, 7, row[2], 1)
        pdf.cell(40, 7, row[3], 1)
        pdf.cell(35, 7, row[4], 1, 1)

    pdf.ln(20)
    pdf.technical_section('EMBEDDED_SYSTEM_METADATA_EXTRACT')
    pdf.set_font('Courier', '', 7)
    pdf.set_text_color(180, 180, 180)
    pdf.multi_cell(0, 4, metadata_json)

    output_path = os.path.join('uploads', filename)
    pdf.output(output_path)
    print(f"Generated: {output_path}")

# Ensure uploads directory exists
if not os.path.exists('uploads'):
    os.makedirs('uploads')

# Report Extra 1: Renal & Neurological
generate_technical_pdf(
    'System_Technical_Report_Extra_1.pdf',
    [
        ['N18.3', 'PRIMARY', 'Chronic kidney disease, stage 3 (moderate)'],
        ['G60.9', 'SECONDARY', 'Hereditary and idiopathic neuropathy, unspecified'],
        ['I15.1', 'SECONDARY', 'Hypertension secondary to other renal disorders'],
        ['E87.1', 'METABOLIC', 'Hypo-osmolality and hyponatremia']
    ],
    [
        ['2160-0', 'Creatinine [Mass/Vol] Serum/Pl', '2.1', 'mg/dL', 'C_HIGH'],
        ['62238-1', 'GFR/BSA.pred.serum creatinine', '42', 'mL/min/1.73m2', 'M_LOW'],
        ['14957-5', 'Microalbumin [Mass/Vol] Urine', '150', 'mg/L', 'C_HIGH'],
        ['2823-3', 'Potassium [Moles/Vol] Serum/Pl', '5.5', 'mmol/L', 'B_HIGH']
    ],
    'IMAGE_UID: 2.16.840.1.113669.632\nRENAL_MORPHOLOGY: Bilateral echogenicity increase. Corticomedullary differentiation reduced.\nNCV_METRICS: Distal latency prolongation > 4.5ms in median/ulnar nerves. Sural amplitude < 5uV.',
    [
        ['RXN_1301', 'Furosemide 40mg', 'ORAL_TAB', '1_QD', '0x71A2'],
        ['RXN_5512', 'Gabapentin 300mg', 'ORAL_CAP', '3_QD', '0x88F1']
    ],
    '{"metadata": {"type": "RENAL-NEURO", "priority": "HIGH", "flags": ["CKD-STAGE-3", "NEUROPATHY"]}}'
)

# Report Extra 2: Hematology & Oncology
generate_technical_pdf(
    'System_Technical_Report_Extra_2.pdf',
    [
        ['D64.9', 'PRIMARY', 'Anemic, unspecified'],
        ['C81.9', 'SECONDARY', 'Hodgkin lymphoma, unspecified'],
        ['D72.829', 'SECONDARY', 'Elevated White Blood Cell Count'],
        ['R59.1', 'SYMPTOM', 'Generalized enlarged lymph nodes']
    ],
    [
        ['718-7', 'Hemoglobin [Mass/Vol] in Blood', '8.2', 'g/dL', 'C_LOW'],
        ['6690-2', 'Leukocytes [#/Vol] in Blood', '18.5', '10^3/uL', 'C_HIGH'],
        ['777-3', 'Platelets [#/Vol] in Blood', '95', '10^3/uL', 'C_LOW'],
        ['2839-9', 'White blood cells: Lymphocytes [#/Vol]', '1.2', '10^3/uL', 'NORMAL']
    ],
    'FLOW_CYTOMETRY: CD15+, CD30+ (Reed-Sternberg equivalent markers). CD3-, CD20-.\nLYMPH_NODE_BIOPSY: Histopathological evidence of modular sclerosis Hodgkin Lymphoma.\nBONE_MARROW: Normocellular with islands of dysplastic megakaryocytes.',
    [
        ['RXN_9921', 'Prednisone 20mg', 'ORAL_TAB', '1_QD', '0xA1B2'],
        ['RXN_7741', 'Ondansetron 8mg', 'ORAL_TAB', 'PRN_NAUSEA', '0xFE91']
    ],
    '{"metadata": {"type": "HEME-ONCO", "priority": "CRITICAL", "flags": ["LYMPHOMA", "PANCYTOPENIA"]}}'
)
