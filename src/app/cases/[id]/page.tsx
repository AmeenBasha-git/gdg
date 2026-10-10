"use client";

import { useState, useEffect, use } from "react";
import { useCases } from "@/lib/useCases";
import TranscriptPanel from "@/components/TranscriptPanel";
import { MapPin, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";

export default function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { cases, isLoaded } = useCases();
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    document.body.classList.add("light-theme");
    return () => document.body.classList.remove("light-theme");
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const found = cases.find((c: any) => c.case_id === resolvedParams.id);
      if (found) setCaseData(found);
    }
  }, [resolvedParams.id, cases, isLoaded]);

  if (!isLoaded || !caseData) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading Case...</div>;

  return (
    <main className="container" style={{ maxWidth: "1400px", marginTop: "1rem" }}>
      <header className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "2rem" }}>Case {caseData.case_id}</h1>
            <span className="status-badge" style={{ 
              background: caseData.state === 'DISPUTE' ? 'rgba(245, 158, 11, 0.2)' : caseData.state === 'ESCALATED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              color: caseData.state === 'DISPUTE' ? '#fcd34d' : caseData.state === 'ESCALATED' ? '#fca5a5' : '#c4b5fd',
              border: `1px solid ${caseData.state === 'DISPUTE' ? '#f59e0b' : caseData.state === 'ESCALATED' ? '#ef4444' : '#8b5cf6'}`
            }}>
              {caseData.state}
            </span>
          </div>
          <p className="subtext">Reported via {caseData.channel} by {caseData.citizen.id} • {new Date(caseData.created_at).toLocaleString()}</p>
        </div>
      </header>

      <div className="grid-layout" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        
        {/* Left Column: Details & Photos */}
        <div className="flex-column" style={{ gap: "2rem" }}>
          <div className="glass-panel flex-column" style={{ gap: "1rem" }}>
            <h3 style={{ borderBottom: "1px solid var(--panel-border)", paddingBottom: "0.5rem" }}>Report Summary</h3>
            <div style={{ marginBottom: "0.5rem" }}>
              <span className="subtext">Subject</span>
              <h4 style={{ fontSize: "1.2rem" }}>{caseData.report.subject || "No subject provided"}</h4>
            </div>
            
            <div style={{ background: "rgba(0,0,0,0.03)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid var(--accent-cyan)" }}>
              <p style={{ fontSize: "1rem", whiteSpace: "pre-wrap" }}>"{caseData.report.text}"</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
              <div>
                <span className="subtext" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><AlertCircle size={14}/> Classification</span>
                <p style={{ textTransform: "capitalize", fontWeight: "bold" }}>{caseData.grievance_type || "Issue"} / {caseData.category}</p>
              </div>
              <div>
                <span className="subtext" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}><MapPin size={14}/> Location</span>
                <p style={{ fontWeight: "bold" }}>{caseData.location.ward} - {caseData.location.street || "Unknown Street"}</p>
                <p className="subtext" style={{ fontSize: "0.8rem" }}>{caseData.location.address_hint}</p>
              </div>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--panel-border)" }}>
               <span className="subtext" style={{ display: "block", marginBottom: "4px" }}>Citizen Details</span>
               <p><strong>{caseData.citizen.name || "Anonymous"}</strong> • {caseData.citizen.mobile || "No Mobile"}</p>
            </div>

            {caseData.report.photos && caseData.report.photos.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <span className="subtext" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}><ImageIcon size={14}/> Attachments</span>
                <img src={caseData.report.photos[0]} alt="Report" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
              </div>
            )}
            
            {caseData.report.voice_note && (
              <div style={{ marginTop: "1rem", padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", color: "var(--accent-green)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                🎙️ Voice Note Attached
              </div>
            )}
          </div>

          <div className="glass-panel flex-column" style={{ gap: "1rem" }}>
             <h3 style={{ borderBottom: "1px solid var(--panel-border)", paddingBottom: "0.5rem" }}>Task Ownership</h3>
             {caseData.owners.length === 0 ? (
               <p className="subtext" style={{ fontStyle: "italic" }}>Ownership currently contested or pending assignment.</p>
             ) : (
               caseData.owners.map((owner: any, idx: number) => (
                 <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                   <div>
                     <p style={{ fontWeight: "bold", textTransform: "capitalize", color: "var(--accent-cyan)" }}>{owner.department}</p>
                     <p className="subtext">{owner.task}</p>
                   </div>
                   <span className="status-badge" style={{ alignSelf: "center", background: "rgba(255,255,255,0.1)" }}>{owner.status}</span>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Right Column: Dispute Transcript Panel (Hero Screen) */}
        <div>
          <TranscriptPanel caseData={caseData} />
        </div>

      </div>
    </main>
  );
}
