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
import { ScrollArea } from "./ui/scroll-area";
// (removed Word of the Day) hardcoded placeholder removed
export function HomeDashboard() {
  const [inputLoading, setInputLoading] = useState(false);
  const [isEli5, setIsEli5] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputSubmit = async (message: string, file?: File) => {
    setInputLoading(true);
    setAiResponse(null); // reset previous response

    try {
      // --- Build form data ---
      const formData = new FormData();
      formData.append("message", message);
      formData.append("isEli5", String(isEli5));
      if (file) formData.append("file", file);

      // --- POST request to backend ---
      const response = await fetch("/API_ROUTE_PLACEHOLDER", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send to backend");
      const data = await response.json();

      // --- Store AI response locally ---
      setAiResponse(data.response || "The AI assistant responded successfully!");

      // --- Optionally dispatch message globally ---
      window.dispatchEvent(
        new CustomEvent("ai-message", {
          detail: { message, file, isEli5, backendResponse: data },
        })
      );
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Something went wrong while sending your question.");
    } finally {
      setInputLoading(false);
    }
  };

  const handleFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputSubmit(`Uploaded file: ${file.name}`, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleContinueConversation = () => {
    window.dispatchEvent(new CustomEvent("ai-navigate"));
  };

  const articlesData = [
    {
      link: "https://www.thedailynewsonline.com/news/states-jostle-over-50b-rural-health-fund-as-medicaid-cuts-t...",
      title:
        "States jostle over $50B rural health fund as Medicaid cuts trigger scramble",
      description:
        "WASHINGTON — Nationwide, states are racing to win their share of a new $50 billion rural health fund...",
      image_url:
        "https://bloximages.newyork1.vip.townnews.com/thedailynewsonline.com/content/tncms/assets/v3/editori...",
      keywords: [
        "health economics",
        "medicaid",
        "health care",
        "social programs",
        "health",
        "hospital",
        "medicare (united states)",
        "centers for medicare & medicaid services",
        "politics",
        "make america healthy again",
        "artificial intelligence",
      ],
      creator: ["Sarah Jane TribblE KFF Health News (TNS)"],
      source_name: "The Daily News Online",
    },
    {
      link: "https://www.getsurrey.co.uk/news/health/bbc-doctors-surprising-vitamin-packed-32816782",
      title:
        "BBC doctors' 'surprising' vitamin-packed superfood you can now buy in supermarkets",
      description:
        "You might be surprised to find them at your local supermarket.",
      image_url:
        "https://i2-prod.birminghammail.co.uk/incoming/article32816868.ece/ALTERNATES/s615/0_GettyImages-691...",
      keywords: ["health"],
      creator: ["Howard Lloyd"],
      source_name: "Surrey Live",
    },
    {
      link: "https://www.getsurrey.co.uk/news/nhs-alert-call-999-you-32815428",
      title:
        "NHS alert to 'call 999' if you spot this symptom as 'deadly' disease spreads in UK",
      description: "This infection typically kills around one in 10 people who get it.",
      image_url:
        "https://i2-prod.getsurrey.co.uk/incoming/article32815341.ece/ALTERNATES/s615/0_GettyImages-22001253...",
      keywords: ["news"],
      creator: ["Fiona Callingham"],
      source_name: "Surrey Live",
    },
    {
      link: "https://www.havasunews.com/news/gallego-joins-push-to-overhaul-veteran-transition-programs-and-cut-...",
      title:
        "Gallego joins push to overhaul veteran transition programs and cut suicide rates",
      description:
        "Sen. Ruben Gallego is backing a new bipartisan bill aimed at reducing veteran suicide by strengthening transition programs.",
      image_url:
        "https://bloximages.chicago2.vip.townnews.com/havasunews.com/content/tncms/assets/v3/editorial/1/9c/...",
      keywords: [
        "veterans health administration",
        "united states department of veterans affairs",
        "health",
        "veteran",
        "military",
      ],
      creator: ["Today's News-Herald"],
      source_name: "Havasu News",
    },
    {
      link: "https://www.timesargus.com/features/weekend_magazine/health-talk-consider-lung-cancer-screening/art...",
      title: "Health Talk: Consider lung cancer screening",
      description:
        "Radiology and early detection for lung cancer screening are a partnership for success.",
      image_url:
        "https://bloximages.chicago2.vip.townnews.com/timesargus.com/content/tncms/custom/image/b304aa08-5df...",
      keywords: ["weekend_magazine", "health"],
      creator: ["Ashley Kiernan"],
      source_name: "Times Argus",
    },
  ];

  return (
  <div className="flex flex-col p-8 max-w-7xl mx-auto">
      {/* AI Medical Assistant Hero Card (with inline AiInput) */}
      <div className="flex justify-center mb-16">
        <div className="w-full max-w-4xl min-h-[420px] p-2 md:p-6 lg:p-8 flex flex-col gap-10">
          <CardHeader>
            <CardTitle className="text-6xl">
              Ask anything about your health — get clear, reliable answers.
            </CardTitle>
            <p className="text-md text-muted-foreground mt-2">
              Get concise, trustworthy medical explanations — attach lab results
              or ask general health questions.
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <AiInput
                onSubmit={handleInputSubmit}
                isLoading={inputLoading}
                variant="inline"
              />

              <div className="flex items-center justify-between mt-2 w-full">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEli5}
                    onChange={(e) => setIsEli5(e.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="text-base">
                    Explain it to me in simpler terms
                  </span>
                </label>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFilePicked}
                    accept=".pdf,.doc,.docx,.png,.jpg"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                    </svg>
                    Upload medical documents
                  </button>
                </div>
              </div>

              <div className="flex justify-center items-center">
                <div className="text-md text-muted-foreground mt-5">
                  Try: “Explain my cholesterol test results in plain English.”
                </div>
              </div>

              {/* --- Display AI Response --- */}
              {aiResponse && (
                <Card className="mt-10 bg-gray-50 shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800">
                      AI Assistant’s Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleContinueConversation}
                        className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 transition"
                      >
                        Continue Conversation →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </div>
      </div>

      {/* --- Health Insights Section --- */}
      <div className="text-5xl font-semibold mt-10 mb-6">
        Personalize Health Insights
      </div>

      <div className="grid grid-cols-12 gap-6 mb-16">
        <div className="col-span-12 grid grid-cols-12 gap-6" style={{ minHeight: '340px' }}>
          <div className="col-span-4 h-full">
            <VitalsSummaryCard
              weight={143}
              weightChange={1.5}
              heartRate={72}
              bp="118 / 78"
              deviceStatus="Stable"
            />
          </div>
          <div className="col-span-4 h-full">
            <TrendsOverview
              heartRate={[70, 72, 71, 74, 73]}
              weight={[142, 143, 144, 144, 145]}
              fluid={[0.3, 0.4, 0.5, 0.4, 0.6]}
            />
          </div>
          <div className="col-span-4 h-full">
            <DeviceStatusCard
              deviceName="Medtronic CRT-D"
              battery={78}
              implantDate="Mar 2023"
              connection="Active"
              lastSync="3 hrs ago"
            />
          </div>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articlesData.map((article) => (
              <ArticleCard
                key={article.link}
                image={article.image_url}
                title={article.title}
                summary={article.description}
                tags={article.keywords.slice(0, 3)} // limit tags for cleaner UI
                source={article.source_name}
                url={article.link}
              />
            ))}

            {articlesData.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                No articles match your search.
              </div>
            )}
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

