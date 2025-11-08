import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function Signup() {
  const [date, setDate] = useState<Date | undefined>();
  const [conditions, setConditions] = useState<string[]>([]);
  const [medicalLevel, setMedicalLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    education: "",
    address: "",
    language: "",
  });

  const medicalTerms = [
    "Cough",
    "Inflammation",
    "Hypertension",
    "Atrial Fibrillation",
    "Idiopathic Pulmonary Fibrosis",
  ];

  const preexistingOptions = [
    "Diabetes",
    "Asthma",
    "High Blood Pressure",
    "Heart Disease",
    "Arthritis",
    "Chronic Pain",
    "Cancer",
    "Obesity",
    "Thyroid Disorder",
    "Depression",
    "Anxiety",
    "Sleep Apnea",
    "Other",
  ];

  const toggleCondition = (cond: string) => {
    setConditions((prev) =>
      prev.includes(cond)
        ? prev.filter((c) => c !== cond)
        : [...prev, cond]
    );
  };

  const allFilled =
    formData.name &&
    formData.password &&
    formData.education &&
    date &&
    formData.address &&
    formData.language;

  const handleSubmit = async () => {
    if (!allFilled) return;

    setLoading(true);
    try {
      // Placeholder POST API — replace later
      const response = await fetch("https://example.com/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          birthdate: date,
          conditions,
          medicalLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      // You can handle the response as needed
      console.log("Signup successful:", await response.json());

      // Navigate to home or dashboard
      navigate("/home");
    } catch (error) {
      console.error("Signup error:", error);
      alert("There was an error signing up. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left side - image */}
      <div className="hidden md:flex md:w-1/2 bg-muted">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/020/933/072/small/abstract-blur-gradient-background-vector.jpg"
          alt="Healthcare background"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right side - scrollable form */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-start p-10 overflow-y-auto">
        <div className="w-full max-w-4/5 space-y-8">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Create Your Account
            </h1>
            <p className="text-lg text-muted-foreground">
              Tell us a bit about yourself to get started.
            </p>
          </div>

          {/* Name */}
          <div className="grid gap-2 text-base">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              className="text-lg"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="grid gap-2 text-base">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              className="text-lg"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* Education */}
          <div className="grid gap-2 text-base">
            <Label>Education</Label>
            <Select
              onValueChange={(v) =>
                setFormData({ ...formData, education: v })
              }
            >
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highschool">High School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="bachelor">Bachelor’s Degree</SelectItem>
                <SelectItem value="master">Master’s Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birthdate */}
          <div className="grid gap-2 text-base">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-lg"
                >
                  {date ? format(date, "PPP") : "Pick a date"}
                  <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Address */}
          <div className="grid gap-2 text-base">
            <Label>Address</Label>
            <Input
              className="text-lg"
              placeholder="123 Main St, Springfield"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* Language */}
          <div className="grid gap-2 text-base">
            <Label>Preferred Language</Label>
            <Select
              onValueChange={(v) =>
                setFormData({ ...formData, language: v })
              }
            >
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="mandarin">Mandarin</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preexisting Conditions */}
          <div className="grid gap-3 text-base">
            <Label>Preexisting Conditions</Label>
            <div className="grid grid-cols-2 gap-2">
              {preexistingOptions.map((cond) => (
                <div key={cond} className="flex items-center space-x-2">
                  <Checkbox
                    id={cond}
                    checked={conditions.includes(cond)}
                    onCheckedChange={() => toggleCondition(cond)}
                  />
                  <Label htmlFor={cond}>{cond}</Label>
                </div>
              ))}
            </div>
            {conditions.includes("Other") && (
              <Input placeholder="Please specify" className="text-lg" />
            )}
          </div>

          {/* Medical Literacy */}
          <div className="grid gap-2 border-t border-muted pt-6">
            <Label className="text-lg font-medium">
              Medical Literacy Level
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Move the slider to match how familiar you are with medical
              terminology.
            </p>
            <Slider
              value={[medicalLevel]}
              onValueChange={(v) => setMedicalLevel(v[0])}
              min={1}
              max={5}
              step={1}
            />
            <p className="text-sm text-center text-muted-foreground mt-2">
              Level {medicalLevel}: {medicalTerms[medicalLevel - 1]}
            </p>
          </div>

          {/* Link Medical Provider */}
          <div className="grid gap-2 text-base">
            <Label>Link Medical Provider</Label>
            <Button variant="secondary" disabled>
              Link Provider (coming soon)
            </Button>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full text-lg"
              disabled={!allFilled || loading}
              onClick={handleSubmit}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
