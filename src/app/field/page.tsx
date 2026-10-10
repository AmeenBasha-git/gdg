"use client";

import { useState } from "react";
import { useCases } from "@/lib/useCases";
import { MapPin, Camera, Upload, CheckCircle2 } from "lucide-react";

export default function FieldCrewView() {
  const { cases, updateCase, isLoaded } = useCases();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  if (!isLoaded) return null;

  // Filter tasks that are assigned or new (mocking assigned state for demo)
  const myTasks = cases.filter((c: any) => c.state === "ASSIGNED" || c.state === "NEW");

  const handleResolve = (caseId: string) => {
    updateCase(caseId, { state: "VERIFIED" });
    setActiveTask(null);
    setPhotoUploaded(false);
  };

  return (
    <main className="container flex-column" style={{ maxWidth: "600px", marginTop: "1rem", gap: "1.5rem" }}>
      <header>
        <h1 style={{ fontSize: "1.75rem" }}>Field Crew App</h1>
        <p className="subtext">Assigned to: Corporation (Ward W-12)</p>
      </header>

      {myTasks.length === 0 && <p className="subtext">No pending tasks.</p>}

      {myTasks.map((task: any) => (
        <div key={task.case_id} className="glass-panel flex-column" style={{ gap: "1rem", padding: "1.25rem" }}>
          <div className="flex-between">
            <span style={{ fontWeight: "bold" }}>{task.case_id}</span>
            <span className="status-badge status-pending" style={{ background: "rgba(139, 92, 246, 0.2)", border: "none" }}>Assigned</span>
          </div>
          
          <div>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--accent-cyan)", fontWeight: "bold" }}>{task.grievance_type || "Issue"} • {task.category}</span>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{task.report.subject || "No Subject"}</h3>
            <p className="subtext flex-between" style={{ justifyContent: "flex-start", gap: "6px" }}>
              <MapPin size={14} /> {task.location.street || "Unknown Street"} ({task.location.ward})
            </p>
            {task.location.address_hint && <p className="subtext" style={{ fontSize: "0.8rem", marginTop: "4px" }}>{task.location.address_hint}</p>}
          </div>

          <div style={{ background: "rgba(0,0,0,0.03)", padding: "10px", borderRadius: "8px", borderLeft: "3px solid var(--accent-purple)" }}>
            <p style={{ fontSize: "0.95rem" }}>"{task.report.text}"</p>
          </div>
          {task.report.voice_note && <p style={{ fontSize: "0.95rem", color: "var(--accent-green)", fontWeight: "bold" }}>🎙️ Voice note attached</p>}

          <hr style={{ border: "0", borderTop: "1px solid var(--panel-border)" }} />

          {activeTask !== task.case_id ? (
            <button className="glass-button" onClick={() => setActiveTask(task.case_id)}>
              Start Work
            </button>
          ) : (
            <div className="flex-column" style={{ gap: "1rem" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", border: "1px dashed var(--accent-cyan)", textAlign: "center" }}>
                {!photoUploaded ? (
                  <>
                    <Camera size={32} color="var(--accent-cyan)" style={{ marginBottom: "8px" }} />
                    <p style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Capture Proof of Completion</p>
                    <p className="subtext" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>GPS coordinates will be embedded automatically.</p>
                    <button className="glass-button secondary" onClick={() => setPhotoUploaded(true)}>
                      <Upload size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                      Simulate Camera Upload
                    </button>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={32} color="var(--accent-green)" style={{ marginBottom: "8px" }} />
                    <p style={{ fontWeight: "bold", fontSize: "0.9rem", color: "var(--accent-green)" }}>Proof Uploaded & GPS Stamped</p>
                    <p className="subtext" style={{ fontSize: "0.8rem" }}>Awaiting verification agent review.</p>
                  </>
                )}
              </div>

              {photoUploaded && (
                <button className="glass-button" onClick={() => handleResolve(task.case_id)} style={{ background: "linear-gradient(135deg, var(--accent-green), #059669)" }}>
                  Submit & Resolve Task
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </main>
  );
}
