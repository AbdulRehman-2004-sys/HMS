import { DoctorService } from '../doctors/doctors.service';

export interface PublicDoctorProfile {
  id: string;
  slug: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  qualification: string;
  specialization: string;
  department: string;
  departmentSlug: string;
  experience: number;
  gender: string;
  consultationFee: number;
  registrationNumber?: string | null;
  photoUrl: string | null;
  biography: string;
  services: string[];
  isActive: boolean;
  availabilities: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface PublicDepartment {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  shortDescription: string;
  fullDescription: string;
  services: string[];
  doctorCount: number;
  doctors: Array<{
    id: string;
    slug: string;
    fullName: string;
    qualification: string;
    specialization: string;
    experience: number;
    photoUrl: string | null;
  }>;
}

const DOCTOR_ENRICHMENTS: Record<string, {
  slug: string;
  department: string;
  departmentSlug: string;
  photoUrl: string | null;
  biography: string;
  services: string[];
}> = {
  'doc-zafar-iqbal': {
    slug: 'dr-zafar-iqbal',
    department: 'Pediatric Surgery',
    departmentSlug: 'pediatric-surgery',
    photoUrl: '/images/CEO.webp',
    biography: 'Prof. Dr. M Zafar Iqbal is a renowned Senior Pediatric Surgeon and the Chief Executive Officer of LALA Medical Complex. With over 20 years of surgical leadership, he specializes in complex neonatal surgeries, pediatric laparoscopic operations, and emergency pediatric trauma.',
    services: ['Neonatal Anomaly Repair', 'Pediatric Laparoscopy', 'Congenital Surgery', 'Pediatric Emergency Triage', 'Surgical Consultations'],
  },
  'doc-shumaila-irum': {
    slug: 'dr-shumaila-irum',
    department: 'Gynecology & Obstetrics',
    departmentSlug: 'gynecology-obstetrics',
    photoUrl: null,
    biography: 'Dr. Shumaila Irum serves as Medical Superintendent (MS) and Associate Professor. She specializes in maternal healthcare, high-risk obstetric management, physiological patient monitoring, and hospital administrative operations.',
    services: ['Maternal Healthcare', 'High-Risk Pregnancy Care', 'Physiology Consultation', 'Outpatient Antenatal Care'],
  },
  'doc-noor-niazi': {
    slug: 'dr-noor-niazi',
    department: 'General Surgery',
    departmentSlug: 'general-surgery',
    photoUrl: null,
    biography: 'Dr. Noor Ahmed Niazi is a highly experienced Consultant General & Laparoscopic Surgeon specializing in abdominal operations, hernia repairs, appendectomies, and emergency surgical care.',
    services: ['General Surgery', 'Laparoscopic Cholecystectomy', 'Hernia Repair', 'Emergency Trauma Surgery'],
  },
  'doc-afsheen-asif': {
    slug: 'dr-afsheen-asif',
    department: 'Gynecology & Obstetrics',
    departmentSlug: 'gynecology-obstetrics',
    photoUrl: null,
    biography: 'Dr. Afsheen Asif is a compassionate Consultant Gynecologist & Obstetrician specializing in women reproductive health, prenatal/postnatal care, gynecological surgeries, and infertility consultations.',
    services: ['Cesarean Delivery (C-Section)', 'Gynecological Surgeries', 'Infertility Counseling', 'Antenatal & Postnatal Care'],
  },
  'doc-mohtmam-nazir': {
    slug: 'dr-mohtmam-nazir',
    department: 'General Surgery',
    departmentSlug: 'general-surgery',
    photoUrl: null,
    biography: 'Dr. Mohtmam Nazir is an expert in minimal access laparoscopic surgeries, GI tract operations, gall bladder removal, and advanced trauma surgery.',
    services: ['Laparoscopic Surgery', 'Gastrointestinal Operations', 'Thyroid & Breast Surgery', 'Trauma Care'],
  },
  'doc-tahir-mehmood': {
    slug: 'dr-tahir-mehmood',
    department: 'General Surgery',
    departmentSlug: 'general-surgery',
    photoUrl: null,
    biography: 'Dr. Tahir Mehmood is a senior Consultant General Surgeon with extensive experience in elective and emergency surgical procedures.',
    services: ['Elective General Surgery', 'Emergency Surgical Triage', 'Abdominal Operations'],
  },
  'doc-anees-rehman': {
    slug: 'dr-anees-rehman',
    department: 'ENT Surgery',
    departmentSlug: 'ent-surgery',
    photoUrl: null,
    biography: 'Dr. Anees Ur Rehman is a dedicated Consultant ENT Surgeon specializing in ear, nose, throat disorders, endoscopic sinus surgery, tonsillectomy, and hearing impairment management.',
    services: ['Endoscopic Sinus Surgery', 'Tonsillectomy & Adenoidectomy', 'Ear Surgery (Tympanoplasty)', 'Head & Neck Consultations'],
  },
  'doc-amir-hameed': {
    slug: 'dr-amir-hameed',
    department: 'Orthopedics',
    departmentSlug: 'orthopedics',
    photoUrl: null,
    biography: 'Dr. Amir Hameed is a leading Consultant Orthopedic Surgeon specializing in bone fracture management, joint replacement, arthroscopy, and musculoskeletal trauma.',
    services: ['Fracture Fixation & Plaster', 'Joint Replacement', 'Arthroscopic Surgery', 'Back Pain & Spine Consultation'],
  },
  'doc-sajid-ghafoor': {
    slug: 'dr-sajid-ghafoor',
    department: 'Oncology',
    departmentSlug: 'oncology',
    photoUrl: null,
    biography: 'Dr. Sajid Ghafoor is an experienced Consultant Oncologist specializing in cancer radiation therapy, chemotherapy protocol management, tumor evaluation, and palliative patient care.',
    services: ['Chemotherapy Administration', 'Radiation Therapy Planning', 'Cancer Screening', 'Oncology Consultations'],
  },
  'doc-abbas-rasool': {
    slug: 'dr-abbas-rasool',
    department: 'Cardiology',
    departmentSlug: 'cardiology',
    photoUrl: null,
    biography: 'Dr. Syed Abbas Rasool is a senior Consultant Cardiologist specializing in hypertension control, coronary artery disease management, ECG & Echocardiography interpretation, and heart failure care.',
    services: ['Electrocardiogram (ECG)', 'Echocardiography', 'Hypertension & Lipid Management', 'Coronary Disease Evaluation'],
  },
  'doc-asif-hussain': {
    slug: 'dr-asif-hussain',
    department: 'Anesthesiology',
    departmentSlug: 'anesthesiology',
    photoUrl: null,
    biography: 'Dr. Asif Hussain is a skilled Consultant Anesthetist responsible for perioperative general & spinal anesthesia, post-operative pain management, and surgical ICU monitoring.',
    services: ['General Anesthesia', 'Spinal & Epidural Anesthesia', 'Post-Operative Pain Management', 'Critical Care Support'],
  },
};

const DEPARTMENTS_DATA: Array<{
  id: string;
  slug: string;
  name: string;
  iconName: string;
  shortDescription: string;
  fullDescription: string;
  services: string[];
}> = [
  {
    id: 'dept-pediatric-surgery',
    slug: 'pediatric-surgery',
    name: 'Pediatric Surgery',
    iconName: 'Baby',
    shortDescription: 'Specialized neonatal & pediatric surgical interventions.',
    fullDescription: 'Our Pediatric Surgery department is led by senior professors specializing in corrective neonatal procedures, pediatric laparoscopy, congenital defect repairs, and emergency pediatric trauma.',
    services: ['Neonatal Anomaly Repair', 'Pediatric Laparoscopy', 'Congenital Surgery', 'Pediatric Emergency Triage'],
  },
  {
    id: 'dept-gynecology-obstetrics',
    slug: 'gynecology-obstetrics',
    name: 'Gynecology & Obstetrics',
    iconName: 'Users',
    shortDescription: 'Comprehensive maternal care, C-sections, and women healthcare.',
    fullDescription: 'Dedicated to women reproductive health, safe delivery, high-risk pregnancy monitoring, minimally invasive gynecological surgeries, and infertility consultations.',
    services: ['Antenatal & Postnatal Care', 'Cesarean Delivery (C-Section)', 'Infertility Counseling', 'High-Risk Pregnancy Unit'],
  },
  {
    id: 'dept-general-surgery',
    slug: 'general-surgery',
    name: 'General Surgery',
    iconName: 'Scissors',
    shortDescription: 'Advanced laparoscopic, GI tract, hernia, and emergency operations.',
    fullDescription: 'Equipped with sterile operation theatre suites for keyhole laparoscopic gallbladder removals, hernia repairs, abdominal operations, and emergency trauma surgery.',
    services: ['Laparoscopic Cholecystectomy', 'Appendectomy', 'Hernia Repair', 'GI Operations'],
  },
  {
    id: 'dept-orthopedics',
    slug: 'orthopedics',
    name: 'Orthopedics',
    iconName: 'Activity',
    shortDescription: 'Bone fracture alignment, joint replacement, and trauma management.',
    fullDescription: 'Specializing in musculoskeletal trauma, bone fracture fixation, joint care, arthroscopy, and back pain rehabilitation.',
    services: ['Fracture Fixation', 'Joint Replacement', 'Arthroscopy', 'Musculoskeletal Rehabilitation'],
  },
  {
    id: 'dept-ent-surgery',
    slug: 'ent-surgery',
    name: 'ENT Surgery',
    iconName: 'Ear',
    shortDescription: 'Ear, nose, throat, and endoscopic sinus operations.',
    fullDescription: 'Comprehensive treatment for ear infections, sinus disorders, hearing loss, tonsillectomies, and head & neck surgical consultations.',
    services: ['Endoscopic Sinus Surgery', 'Tonsillectomy', 'Tympanoplasty', 'Head & Neck Care'],
  },
  {
    id: 'dept-cardiology',
    slug: 'cardiology',
    name: 'Cardiology',
    iconName: 'Heart',
    shortDescription: 'Cardiovascular diagnostics, ECG, Echocardiography, and BP management.',
    fullDescription: 'Providing non-invasive cardiac evaluation, blood pressure regulation, ECG interpretation, Color Doppler Echocardiography, and lipid management.',
    services: ['ECG & Cardiac Monitoring', 'Echocardiography', 'Hypertension Clinic', 'Heart Failure Care'],
  },
  {
    id: 'dept-oncology',
    slug: 'oncology',
    name: 'Oncology',
    iconName: 'ShieldAlert',
    shortDescription: 'Cancer diagnostic screening, chemotherapy protocols, and tumor consultation.',
    fullDescription: 'Offering empathetic cancer care, chemotherapy planning, tumor screening, and palliative consultation.',
    services: ['Chemotherapy', 'Cancer Screening', 'Tumor Board Evaluation', 'Palliative Care'],
  },
  {
    id: 'dept-anesthesiology',
    slug: 'anesthesiology',
    name: 'Anesthesiology',
    iconName: 'Syringe',
    shortDescription: 'Perioperative pain management and surgical anesthesia care.',
    fullDescription: 'Managing safe general, spinal, and epidural anesthesia for operating theatre suites and post-operative ICU care.',
    services: ['General Anesthesia', 'Regional Anesthesia', 'Post-Op Analgesia', 'ICU Airway Management'],
  },
  {
    id: 'dept-pathology-laboratory',
    slug: 'pathology-laboratory',
    name: 'Pathology & Laboratory',
    iconName: 'FlaskConical',
    shortDescription: '24/7 automated blood chemistry, hematology, and microbiology testing.',
    fullDescription: 'Fully automated diagnostic lab offering CBC, LFT, RFT, Urine RE, and serology with direct EMR report integration.',
    services: ['CBC & Blood Indices', 'Liver & Kidney Function Tests', 'Blood Glucose & HbA1c', 'Serology & Urine RE'],
  },
  {
    id: 'dept-radiology-imaging',
    slug: 'radiology-imaging',
    name: 'Radiology & PACS Imaging',
    iconName: 'FileText',
    shortDescription: 'High-resolution Digital X-Ray, Color Doppler USG, and PACS archiving.',
    fullDescription: 'Digital imaging center featuring digital X-Rays, abdominal/pelvic Ultrasound, and instant workstation PACS storage.',
    services: ['Digital X-Ray (PA/AP)', 'Color Doppler Ultrasound', 'Abdominal USG', 'PACS Digital Storage'],
  },
  {
    id: 'dept-emergency-care',
    slug: 'emergency-care',
    name: 'Emergency & Critical Care',
    iconName: 'PhoneCall',
    shortDescription: '24/7 emergency trauma response, triage, and ICU bed care.',
    fullDescription: 'Round-the-clock emergency trauma bay with resuscitation lines, 24/7 medical officers, and ambulance dispatch.',
    services: ['Trauma Resuscitation', '24/7 Emergency Triage', 'ICU Care', 'Ambulance Dispatch'],
  },
];

export class PublicService {
  /**
   * Helper to enrich raw HMS DoctorDTO into PublicDoctorProfile
   */
  private static async enrichDoctor(doc: any): Promise<PublicDoctorProfile> {
    const enrichment = DOCTOR_ENRICHMENTS[doc.id] || {
      slug: `dr-${doc.firstName.toLowerCase()}-${doc.lastName.toLowerCase()}`.replace(/[^a-z0-9-]/g, ''),
      department: doc.specialization,
      departmentSlug: doc.specialization.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      photoUrl: null,
      biography: `${doc.fullName} is an experienced ${doc.specialization} at LALA Medical Complex with ${doc.experience} years of clinical expertise.`,
      services: ['Outpatient Consultation', 'Clinical Evaluation', 'Patient Care'],
    };

    // Fetch availability schedules from HMS DB
    let availabilities: Array<{ id: string; dayOfWeek: string; startTime: string; endTime: string }> = [];
    try {
      const schedule = await DoctorService.getDoctorAvailabilities(doc.id);
      availabilities = schedule.map((a: any) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      }));
    } catch {
      availabilities = [];
    }

    return {
      id: doc.id,
      slug: enrichment.slug,
      userId: doc.userId,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      fullName: doc.fullName || `Dr. ${doc.firstName} ${doc.lastName}`,
      phone: doc.phone,
      qualification: doc.qualification,
      specialization: doc.specialization,
      department: enrichment.department,
      departmentSlug: enrichment.departmentSlug,
      experience: doc.experience,
      gender: doc.gender,
      consultationFee: doc.consultationFee,
      registrationNumber: doc.registrationNumber || null,
      photoUrl: enrichment.photoUrl,
      biography: enrichment.biography,
      services: enrichment.services,
      isActive: doc.isActive,
      availabilities,
    };
  }

  /**
   * Get Public Doctors with filtering, search, availability filter, and sorting
   */
  public static async getDoctors(query: {
    search?: string;
    department?: string;
    availability?: string;
    sortBy?: 'name_asc' | 'experience_desc' | 'experience_asc';
  }): Promise<{ doctors: PublicDoctorProfile[]; total: number }> {
    // 1. Fetch raw active doctors from HMS DB
    const { doctors: rawDoctors } = await DoctorService.getDoctors({
      search: query.search,
      isActive: true,
      limit: 100,
    });

    // 2. Enrich doctors
    let enriched = await Promise.all(rawDoctors.map((d) => this.enrichDoctor(d)));

    // 3. Filter by department slug or department name if specified
    if (query.department && query.department !== 'ALL') {
      const deptTerm = query.department.toLowerCase();
      enriched = enriched.filter(
        (d) =>
          d.departmentSlug.toLowerCase() === deptTerm ||
          d.department.toLowerCase().includes(deptTerm)
      );
    }

    // 4. Filter by Day of Week Availability if specified
    if (query.availability && query.availability !== 'ALL') {
      const dayTerm = query.availability.toLowerCase();
      enriched = enriched.filter((d) =>
        d.availabilities.some((a) => a.dayOfWeek.toLowerCase() === dayTerm)
      );
    }

    // 5. Sort doctors
    if (query.sortBy === 'name_asc') {
      enriched.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (query.sortBy === 'experience_asc') {
      enriched.sort((a, b) => a.experience - b.experience);
    } else {
      // Default: experience_desc
      enriched.sort((a, b) => b.experience - a.experience);
    }

    return {
      doctors: enriched,
      total: enriched.length,
    };
  }

  /**
   * Get single Doctor details by ID or Slug
   */
  public static async getDoctorByIdOrSlug(idOrSlug: string): Promise<PublicDoctorProfile | null> {
    const { doctors } = await this.getDoctors({});
    const found = doctors.find(
      (d) => d.id === idOrSlug || d.slug.toLowerCase() === idOrSlug.toLowerCase()
    );

    return found || null;
  }

  /**
   * Get Public Departments with doctor counts and nested doctor summaries
   */
  public static async getDepartments(): Promise<PublicDepartment[]> {
    const { doctors } = await this.getDoctors({});

    return DEPARTMENTS_DATA.map((dept) => {
      const deptDoctors = doctors.filter(
        (d) => d.departmentSlug.toLowerCase() === dept.slug.toLowerCase()
      );

      return {
        ...dept,
        doctorCount: deptDoctors.length,
        doctors: deptDoctors.map((d) => ({
          id: d.id,
          slug: d.slug,
          fullName: d.fullName,
          qualification: d.qualification,
          specialization: d.specialization,
          experience: d.experience,
          photoUrl: d.photoUrl,
        })),
      };
    });
  }

  /**
   * Get single Department details by ID or Slug
   */
  public static async getDepartmentByIdOrSlug(idOrSlug: string): Promise<PublicDepartment | null> {
    const departments = await this.getDepartments();
    const found = departments.find(
      (dept) => dept.id === idOrSlug || dept.slug.toLowerCase() === idOrSlug.toLowerCase()
    );

    return found || null;
  }
}
