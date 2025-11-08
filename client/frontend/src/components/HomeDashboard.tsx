import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { AiInput } from "./AiInput";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArticleCard } from "./ArticleCard";
import { ReminderCard } from "./ReminderCard";
import { DoctorNoteCard } from "./DoctorNoteCard";
// import { Articles } from "./Articles"; // removed, now using inline cards
import { DoctorsMap } from "./DoctorsMap";
import VitalsSummaryCard from './health/VitalsSummaryCard';
import TrendsOverview from './health/TrendsOverview';
import DeviceStatusCard from './health/DeviceStatusCard';
// (removed Word of the Day) hardcoded placeholder removed
export function HomeDashboard() {
  const [inputLoading, setInputLoading] = useState(false);
  const [isEli5, setIsEli5] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputSubmit = async (message: string, file?: File) => {
    setInputLoading(true);

    // Navigate to AI tab and send message to AiChat via events
    window.dispatchEvent(new CustomEvent('ai-navigate'));
    window.dispatchEvent(new CustomEvent('ai-message', { detail: { message, file, isEli5 } }));

    await new Promise((r) => setTimeout(r, 400));
    setInputLoading(false);
  };

  const handleFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputSubmit(`Uploaded file: ${file.name}`, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
  <div className="flex flex-col p-8 max-w-7xl mx-auto">
      {/* AI Medical Assistant Hero Card (with inline AiInput) */}
    <div className="flex justify-center mb-16">
          <div className="w-full max-w-4xl min-h-[420px] p-2 md:p-6 lg:p-8 flex flex-col gap-10">
            <CardHeader>
              <CardTitle className="text-6xl">Ask anything about your health — get clear, reliable answers.</CardTitle>
              <p className="text-md text-muted-foreground mt-2">Get concise, trustworthy medical explanations — attach lab results or ask general health questions.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <AiInput onSubmit={handleInputSubmit} isLoading={inputLoading} variant="inline" />
                </div>

                <div className="flex items-center justify-between mt-2 w-full">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isEli5} onChange={(e) => setIsEli5(e.target.checked)} className="h-5 w-5" />
                    <span className="text-base">Explain it to me in simpler terms</span>
                  </label>
                  <div>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePicked} accept=".pdf,.doc,.docx,.png,.jpg" />
                    <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                      </svg>
                      Upload medical documents
                    </button>
                  </div>
                </div>

                {/* Example */}
                <div className="flex justify-center items-center">
                  <div className="text-md text-muted-foreground mt-5">Try: “Explain my cholesterol test results in plain English.”</div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

    <div className="text-5xl font-semibold mt-10 mb-6">Personalize Health Insights</div>

        {/* Your Health Insights: three cards in one row, AI summary full-width below */}
    <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 grid grid-cols-12 gap-6" style={{ minHeight: '340px' }}>
            <div className="col-span-4 h-full">
              <VitalsSummaryCard weight={143} weightChange={1.5} heartRate={72} bp="118 / 78" deviceStatus="Stable" />
            </div>
            <div className="col-span-4 h-full">
              <TrendsOverview heartRate={[70,72,71,74,73]} weight={[142,143,144,144,145]} fluid={[0.3,0.4,0.5,0.4,0.6]} />
            </div>
            <div className="col-span-4 h-full">
              <DeviceStatusCard deviceName="Medtronic CRT-D" battery={78} implantDate="Mar 2023" connection="Active" lastSync="3 hrs ago" />
            </div>
          </div>

          <div className="col-span-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Quick AI interpretation</div>
                <div className="mt-3 p-4 bg-gray-100 rounded">“Your weight increased slightly today — this can be normal, but monitor for swelling or shortness of breath.”</div>
                <div className="mt-4 flex justify-center">
                  <button className="px-4 py-2 rounded-md bg-primary text-white mx-2">Explain My Numbers</button>
                  <button className="px-4 py-2 rounded-md border mx-2">Message My Care Team</button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Reminders Section */}
    <div className="mt-10 mb-16">
          <h2 className="text-5xl font-semibold mt-10 mb-6">Upcoming Reminders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <ReminderCard
              title="[Appointment] - Next Appointment"
              description="Dr. Nguyen"
              time="Nov 14, 2025 @ 10:00 AM"
              showButton={true}
            />
            <ReminderCard
              title="[Medication Reminder] - Morning Dose"
              description="Take Furosemide"
              time="at 8:00 AM"
            />
            <ReminderCard
              title="[Appointment] - Lab Work"
              description="LabCorp"
              time="Nov 16, 2025 @ 7:30 AM"
              showButton={true}
            />
            <ReminderCard
              title="[Medication Reminder] - Evening Dose"
              description="Take Metoprolol"
              time="at 8:00 PM"
            />
          </div>
        </div>

        {/* Doctor's Notes Section */}
    <div className="mt-10 mb-16">
          <h2 className="text-5xl font-semibold mt-10 mb-6">Doctor's Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <DoctorNoteCard
              name="Dr. Nguyen"
              initials="DN"
              specialty="Cardiology"
              note="Continue current medications and low-sodium diet. Follow-up in 2 weeks."
            />
            <DoctorNoteCard
              name="Dr. Smith"
              initials="JS"
              specialty="Endocrinology"
              note="Blood sugar levels are stable. Maintain current regimen and monitor daily."
            />
            <DoctorNoteCard
              name="Dr. Rodriguez"
              initials="AR"
              specialty="Nephrology"
              note="Kidney function is good. Stay hydrated and continue regular check-ups."
            />
          </div>
        </div>

        {/* Articles and References Section */}
    <div className="mt-10 mb-16">
          <h2 className="text-5xl font-semibold mt-10 mb-6">Notable Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ArticleCard
              image="https://www.geo.tv/assets/uploads/updates/2025-11-07/632573_4046145_updates.jpg"
              title="Emily Simpson says son Luke's condition is ‘very complicated' after PANDAS diagnosis"
              summary="Emily Simpson gets honest about son Luke’s health after PANDAS diseaseEmily Simpson recently reveal..."
              tags={["entertainment", "pakistan"]}
              source="Geo News Digital Desk"
              url="https://www.geo.tv/latest/632573-emily-simpson-gets-honest-about-son-lukes-health-after-pandas-dise..."
            />
            <ArticleCard
              image="https://www.medicalnewstoday.com/content/images/articles/318/318868/a-woman-having-her-heart-rate-monitored.jpg"
              title="Heart Disease: Facts, Statistics, and You"
              summary="Learn about the latest statistics and facts on heart disease, including risk factors and prevention tips."
              tags={["health", "cardiology"]}
              source="Medical News Today"
              url="https://www.medicalnewstoday.com/articles/heart-disease-facts"
            />
            <ArticleCard
              image="https://www.cdc.gov/diabetes/images/library/features/diabetes-basics-600px.jpg"
              title="Diabetes Basics"
              summary="Understand the basics of diabetes, including symptoms, management, and prevention strategies."
              tags={["health", "diabetes"]}
              source="CDC"
              url="https://www.cdc.gov/diabetes/basics/index.html"
            />
            <ArticleCard
              image="https://www.kidney.org/sites/default/files/styles/large/public/atoz/images/kidney-disease.jpg"
              title="Kidney Disease: What You Need to Know"
              summary="Explore the causes, symptoms, and treatments for kidney disease, plus tips for maintaining kidney health."
              tags={["health", "nephrology"]}
              source="National Kidney Foundation"
              url="https://www.kidney.org/atoz/content/kidneydisease"
            />
            <ArticleCard
              image="https://www.cancer.org/content/dam/cancer-org/images/logos/acs-logo-og-image.jpg"
              title="Cancer Basics"
              summary="Get an overview of cancer, including types, risk factors, and common treatments."
              tags={["health", "oncology"]}
              source="American Cancer Society"
              url="https://www.cancer.org/cancer/cancer-basics.html"
            />
            <ArticleCard
              image="https://www.mayoclinic.org/-/media/kcms/gbs/patient-consumer/images/2018/10/11/13/36/influenza-8col.jpg"
              title="Flu: Symptoms and Causes"
              summary="Learn about the symptoms, causes, and prevention of influenza (flu)."
              tags={["health", "infectious disease"]}
              source="Mayo Clinic"
              url="https://www.mayoclinic.org/diseases-conditions/flu/symptoms-causes/syc-20351719"
            />
          </div>
        </div>

        {/* Nearby Doctors Section */}
        <div className="mb-16">
          <h2 className="text-5xl font-semibold mt-10 mb-6">Doctors & Clinics Near You</h2>
          <DoctorsMap />
        </div>
    </div>
  );
}

