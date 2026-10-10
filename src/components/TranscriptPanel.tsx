import React from 'react';
import { ShieldAlert, Split, CheckCircle2, XCircle, Info, Clock, AlertTriangle } from 'lucide-react';

export default function TranscriptPanel({ caseData }: { caseData: any }) {
  const { messages, state, sla } = caseData;

  const isBreached = new Date(sla.deadline) < new Date();

  return (
    <div className="glass-panel flex-column" style={{ padding: "1.5rem", gap: "1.5rem" }}>
      <div className="flex-between" style={{ borderBottom: "1px solid var(--panel-border)", paddingBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "4px" }}>Dispute Transcript</h2>
          <p className="subtext">Evidence-backed departmental referral protocol</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ background: isBreached ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)", padding: "6px 12px", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center", border: `1px solid ${isBreached ? "var(--accent-red)" : "var(--accent-green)"}` }}>
            <Clock size={16} color={isBreached ? "#fca5a5" : "#6ee7b7"} />
            <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: isBreached ? "#fca5a5" : "#6ee7b7" }}>
              {isBreached ? "SLA Breached" : "SLA Running"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-column" style={{ gap: "1.5rem" }}>
        {messages.map((msg: any, index: number) => (
          <div key={msg.id} style={{ display: "flex", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--panel-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "bold" }}>
                {msg.hop}
              </div>
              {index !== messages.length - 1 && <div style={{ width: "2px", flex: 1, background: "var(--panel-border)", margin: "4px 0" }}></div>}
            </div>
            
            <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid var(--panel-border)", padding: "1rem" }}>
              <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <strong style={{ textTransform: "capitalize", color: "var(--accent-cyan)" }}>{msg.from.replace('_agent', '')}</strong>
                  <span className="subtext">→</span>
                  <span className="subtext">Engine</span>
                </div>
                
                <span className="status-badge" style={{ 
                  background: msg.type === 'reject' ? 'rgba(239, 68, 68, 0.2)' : msg.type === 'split' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: msg.type === 'reject' ? '#fca5a5' : msg.type === 'split' ? '#c4b5fd' : '#6ee7b7',
                  display: "flex", gap: "4px", alignItems: "center"
                }}>
                  {msg.type === 'reject' && <XCircle size={14} />}
                  {msg.type === 'split' && <Split size={14} />}
                  {msg.type === 'accept' && <CheckCircle2 size={14} />}
                  {msg.type.toUpperCase()}
                </span>
              </div>

              {msg.target && (
                <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Proposed routing to <strong style={{ color: "var(--accent-purple)", textTransform: "capitalize" }}>{msg.target.replace('_agent', '')}</strong>.
                </p>
              )}

              {msg.sub_tasks && (
                <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "12px", borderRadius: "8px", marginBottom: "1rem", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "#c4b5fd" }}>Proposed Split:</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {msg.sub_tasks.map((task: any, i: number) => (
                      <li key={i} style={{ fontSize: "0.85rem", display: "flex", gap: "8px" }}>
                        <span style={{ color: "var(--accent-cyan)", textTransform: "capitalize" }}>{task.department}:</span>
                        <span style={{ color: "var(--text-secondary)" }}>{task.rationale}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <ShieldAlert size={14} color="var(--accent-cyan)" /> Evidence Provided (Confidence: {Math.round(msg.confidence * 100)}%)
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {msg.evidence.map((ev: any, i: number) => (
                    <li key={i} style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--text-primary)" }}>"{ev.finding}"</span>
                      <span className="subtext" style={{ marginLeft: "8px" }}>(Source: {ev.source} / ref: {ev.ref})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state === "ESCALATED" && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--accent-red)", display: "flex", gap: "12px" }}>
          <AlertTriangle color="#fca5a5" />
          <div>
            <h4 style={{ color: "#fca5a5", marginBottom: "4px" }}>Escalated to Zonal Officer</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Transfer cap reached. Automated routing paused pending human adjudication.</p>
          </div>
        </div>
      )}
      
      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
        * Registry and history data are synthetic. 
      </p>
    </div>
  );
}
