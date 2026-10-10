"use client";

import { useState, useEffect } from "react";
import { useCases } from "@/lib/useCases";
import { Mic, MapPin, Paperclip, CheckCircle2 } from "lucide-react";

export default function CitizenPortal() {
  const { addCase } = useCases();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("complaint"); // "needs", "complaint", "voice"
  
  // Force light theme for this specific design
  useEffect(() => {
    document.body.classList.add("light-theme");
    return () => document.body.classList.remove("light-theme");
  }, []);

  // Form State
  const [grievance, setGrievance] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [ward, setWard] = useState("");
  
  const [gps, setGps] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Photo & Voice State
  const [hasAttachment, setHasAttachment] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [voiceLanguage, setVoiceLanguage] = useState("en");

  const handleVoiceRecord = () => {
    if (isRecording) return;
    
    const fallbackMockRecording = () => {
      setIsRecording(true);
      setVoiceNote(false);
      let time = 0;
      const interval = setInterval(() => {
        time += 1;
        setRecordingTime(time);
        if (time >= 5) { 
          clearInterval(interval);
          setIsRecording(false);
          setVoiceNote(true);
          setRecordingTime(0);
          if (activeTab === "voice") {
             setDescription("The streetlight is completely broken on my street and it is very dark at night.");
          }
        }
      }, 1000);
    };

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      let hasError = false;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; // Hardcoded to English per user request
      recognition.interimResults = true;
      recognition.continuous = false;
      
      let timer: NodeJS.Timeout;
      
      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceNote(false);
        if (activeTab === "voice") setDescription("");
        
        let time = 0;
        timer = setInterval(() => {
          time += 1;
          setRecordingTime(time);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (activeTab === "voice") setDescription(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        hasError = true;
        console.warn("Speech recognition issue:", event.error);
        setIsRecording(false);
        clearInterval(timer);
        setRecordingTime(0);
        
        if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'no-speech') {
           // Silently fallback to mock recording without interrupting the user with an alert
           fallbackMockRecording();
        }
      };

      recognition.onend = () => {
        if (hasError) return;
        setIsRecording(false);
        setVoiceNote(true);
        clearInterval(timer);
        setRecordingTime(0);
      };

      try {
        recognition.start();
      } catch (e) {
        fallbackMockRecording();
      }
    } else {
      fallbackMockRecording();
    }
  };

  const handleGps = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
        },
        (error) => {
          alert("Could not get GPS location.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "complaint") {
      if (!grievance || !category || !subject || !description) {
        return alert("Please fill all mandatory Complaint Details.");
      }
    } else if (activeTab === "voice") {
      if (!description && !voiceNote) {
        return alert("Please record a voice complaint or type your issue.");
      }
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newId = `C-2026-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newCase = {
        case_id: newId,
        created_at: new Date().toISOString(),
        channel: activeTab === "voice" ? "voice" : "web",
        citizen: { 
          id: `user-${Math.floor(Math.random() * 1000)}`, 
          language: activeTab === "voice" ? voiceLanguage : "en",
          name: fullName || "Anonymous",
          mobile: mobile || "N/A"
        },
        report: {
          subject: activeTab === "voice" ? "Voice Complaint" : subject,
          text: description,
          photos: hasAttachment ? ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400"] : [],
          voice_note: voiceNote ? "true" : null
        },
        category: category || "unclassified",
        grievance_type: grievance || "unclassified",
        severity: "medium",
        location: { 
          lat: gps ? gps.lat : 13.0, 
          lng: gps ? gps.lng : 80.0, 
          ward: ward, 
          street: "N/A",
          address_hint: "N/A" 
        },
        state: "NEW",
        sla: { deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), breached: false },
        owners: [],
        hop_count: 0,
        rejected_by: [],
        duplicate_of: null,
        messages: []
      };

      addCase(newCase);
      setIsSubmitting(false);
      setSubmittedId(newId);
    }, 1500);
  };

  const primaryAccent = "#0ea5e9";
  const labelStyle = { fontWeight: 600, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "6px" };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a" };
  const sectionTitleStyle = { color: primaryAccent, fontSize: "0.9rem", fontWeight: "bold", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "1.5rem 0 1rem 0" };

  return (
    <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "2rem" }}>
      
      {/* Top Tabs Mockup */}
      <div style={{ display: "flex", justifyContent: "center", background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "1rem", gap: "1rem" }}>
        <button onClick={() => setActiveTab("complaint")} style={{ padding: "8px 24px", color: activeTab === "complaint" ? primaryAccent : "#64748b", fontWeight: activeTab === "complaint" ? "bold" : "normal", background: activeTab === "complaint" ? "#fff" : "none", border: activeTab === "complaint" ? `1px solid ${primaryAccent}` : "none", borderRadius: "8px", cursor: "pointer", boxShadow: activeTab === "complaint" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none" }}>Complaint</button>
        <button onClick={() => setActiveTab("voice")} style={{ padding: "8px 24px", color: activeTab === "voice" ? primaryAccent : "#64748b", fontWeight: activeTab === "voice" ? "bold" : "normal", background: activeTab === "voice" ? "#fff" : "none", border: activeTab === "voice" ? `1px solid ${primaryAccent}` : "none", borderRadius: "8px", cursor: "pointer", boxShadow: activeTab === "voice" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none" }}>Voice Complaint</button>
      </div>

      <div style={{ maxWidth: "800px", margin: "2rem auto", background: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
        
        {!submittedId ? (
          <form onSubmit={handleSubmit} className="flex-column" style={{ gap: "0.5rem" }}>
            
            {activeTab === "complaint" && (
              <>
                <h3 style={sectionTitleStyle}>COMPLAINT DETAILS</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Grievance <span style={{color: primaryAccent}}>*</span></label>
                    <select style={inputStyle} value={grievance} onChange={(e) => setGrievance(e.target.value)} required>
                      <option value="" disabled>Select grievance type</option>
                      <option value="civic">Civic Issue</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="health">Health & Sanitation</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Category <span style={{color: primaryAccent}}>*</span></label>
                    <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)} required>
                      <option value="" disabled>Select category</option>
                      <option value="waterlogging">Waterlogging / Leak</option>
                      <option value="streetlight">Streetlight Out</option>
                      <option value="pothole">Potholes</option>
                      <option value="garbage">Garbage Pile</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <label style={labelStyle}>Subject <span style={{color: primaryAccent}}>*</span></label>
                  <input type="text" style={inputStyle} placeholder="Brief subject of your complaint" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <label style={labelStyle}>Description <span style={{color: primaryAccent}}>*</span></label>
                  <textarea style={{...inputStyle, minHeight: "120px"}} placeholder="Describe your complaint in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>

                <h3 style={sectionTitleStyle}>ATTACHMENTS</h3>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "8px", fontWeight: "bold" }}>Voice Complaint <span style={{fontWeight: "normal", color: "#94a3b8"}}>(optional — record in your own words)</span></p>
                  <button type="button" onClick={handleVoiceRecord} style={{ display: "flex", alignItems: "center", gap: "8px", background: isRecording || voiceNote ? "#059669" : primaryAccent, color: "#fff", padding: "10px 20px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                    {voiceNote ? <CheckCircle2 size={16} /> : <Mic size={16} />}
                    {isRecording ? `Recording... 0:0${recordingTime}` : voiceNote ? "Voice Recorded" : "Start Recording"}
                  </button>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "8px", fontWeight: "bold" }}>Attachments <span style={{fontWeight: "normal", color: "#94a3b8"}}>(photos, video, voice — optional)</span></p>
                  <button type="button" onClick={() => setHasAttachment(true)} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", background: hasAttachment ? "#f0fdf4" : "#f8fafc", border: `1px dashed ${hasAttachment ? "#22c55e" : "#cbd5e1"}`, color: hasAttachment ? "#15803d" : "#64748b", padding: "16px", borderRadius: "8px", cursor: "pointer" }}>
                    <Paperclip size={16} />
                    {hasAttachment ? "Photo Attached Successfully" : "Add photo, video or voice note"}
                  </button>
                </div>
              </>
            )}

            {activeTab === "voice" && (
              <div style={{ textAlign: "center", margin: "1rem 0 2rem 0" }}>
                <p style={{ color: "#475569", marginBottom: "1rem" }}>Speak your complaint in Tamil or English. Tap the mic to start.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
                  <button type="button" onClick={() => setVoiceLanguage("ta")} style={{ padding: "6px 20px", borderRadius: "20px", border: `1px solid ${voiceLanguage === 'ta' ? primaryAccent : '#cbd5e1'}`, background: voiceLanguage === 'ta' ? primaryAccent : '#fff', color: voiceLanguage === 'ta' ? '#fff' : '#475569', cursor: "pointer" }}>Tamil</button>
                  <button type="button" onClick={() => setVoiceLanguage("en")} style={{ padding: "6px 20px", borderRadius: "20px", border: `1px solid ${voiceLanguage === 'en' ? primaryAccent : '#cbd5e1'}`, background: voiceLanguage === 'en' ? primaryAccent : '#fff', color: voiceLanguage === 'en' ? '#fff' : '#475569', cursor: "pointer" }}>English</button>
                </div>

                <div style={{ margin: "2rem 0" }}>
                  <button type="button" onClick={handleVoiceRecord} style={{ width: "80px", height: "80px", borderRadius: "50%", background: isRecording ? "#ef4444" : primaryAccent, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                    {isRecording ? <div style={{width: "24px", height: "24px", background: "#fff", borderRadius: "4px"}}></div> : <Mic size={36} />}
                  </button>
                  <p style={{ color: "#64748b", marginTop: "1rem", fontSize: "0.9rem" }}>{isRecording ? "Listening..." : "Tap to speak"}</p>
                </div>

                <textarea style={{...inputStyle, minHeight: "100px", textAlign: "center", fontStyle: description ? "normal" : "italic", background: "#f8fafc"}} placeholder="Your words will appear here..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>
            )}


            <h3 style={sectionTitleStyle}>YOUR DETAILS <span style={{fontSize: "0.75rem", color: "#94a3b8", fontWeight: "normal"}}>(OPTIONAL - HELPS US FOLLOW UP)</span></h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" style={inputStyle} placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <input type="tel" style={inputStyle} placeholder="10-digit mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
            </div>

            <h3 style={sectionTitleStyle}>LOCATION</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Ward <span style={{color: primaryAccent}}>*</span></label>
                <select style={inputStyle} value={ward} onChange={(e) => setWard(e.target.value)} required>
                  <option value="" disabled>Select Ward</option>
                  <option value="Ward 34">Ward 34</option>
                  <option value="Ward 35">Ward 35</option>
                  <option value="Ward 36">Ward 36</option>
                </select>
              </div>
              
              <div style={{ marginTop: "0.5rem" }}>
                <label style={labelStyle}>Your Location <span style={{color: primaryAccent}}>*</span></label>
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "8px" }}>Required — share your location to help us identify the exact spot.</p>
                <button type="button" onClick={handleGps} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: `1px solid ${primaryAccent}`, color: primaryAccent, padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  <MapPin size={16} />
                  {isLocating ? "Locating..." : gps ? `GPS Set (${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})` : "Use My Location"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button type="submit" disabled={isSubmitting} style={{ width: "100%", background: primaryAccent, color: "#fff", padding: "14px", borderRadius: "8px", border: "none", fontSize: "1rem", fontWeight: "bold", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>

          </form>
        ) : (
          <div className="flex-column" style={{ alignItems: "center", textAlign: "center", padding: "4rem 2rem", gap: "1rem" }}>
            <div style={{ fontSize: "4rem", color: "#10b981" }}><CheckCircle2 size={64} /></div>
            <h2>Complaint Logged Successfully</h2>
            <p style={{ color: "#64748b" }}>
              Ticket <strong style={{ color: primaryAccent }}>#{submittedId}</strong> has been generated and evaluated by the Case Engine.
            </p>
            <button onClick={() => {
              setSubmittedId(null);
              setCategory("");
              setGrievance("");
              setSubject("");
              setDescription("");
              setVoiceNote(false);
              setHasAttachment(false);
            }} style={{ marginTop: "1rem", background: "#fff", border: `1px solid ${primaryAccent}`, color: primaryAccent, padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
              Report Another Issue
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
