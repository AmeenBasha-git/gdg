"use client";

import { useEffect } from "react";
import { useCases } from "@/lib/useCases";
import Link from "next/link";
import { Search, Filter, Clock } from "lucide-react";

export default function CaseList() {
  const { cases, isLoaded } = useCases();

  useEffect(() => {
    document.body.classList.add("light-theme");
    return () => document.body.classList.remove("light-theme");
  }, []);

  if (!isLoaded) return null;

  return (
    <main className="container flex-column" style={{ maxWidth: "1200px", marginTop: "1rem", gap: "2rem" }}>
      <header className="flex-between">
        <div>
          <h1 style={{ fontSize: "2rem" }}>Officer Dashboard</h1>
          <p className="subtext">View and manage civic cases across all wards.</p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: "1rem 1.5rem" }}>
        <div className="flex-between">
          <div style={{ display: "flex", gap: "1rem", flex: 1, marginRight: "2rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="var(--text-secondary)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" className="glass-input" placeholder="Search Case ID or keyword..." style={{ paddingLeft: "40px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="glass-button secondary flex-between" style={{ gap: "8px", padding: "8px 16px" }}>
              <Filter size={16} /> Status
            </button>
            <button className="glass-button secondary flex-between" style={{ gap: "8px", padding: "8px 16px" }}>
              <Filter size={16} /> Ward
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--panel-border)", background: "rgba(0,0,0,0.2)" }}>
              <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Case ID</th>
              <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Category</th>
              <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Location</th>
              <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>State</th>
              <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>SLA Deadline</th>
              <th style={{ padding: "1rem", color: "var(--text-secondary)" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const isBreached = new Date(c.sla.deadline) < new Date();
              
              return (
                <tr key={c.case_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "1rem", fontWeight: "bold" }}>{c.case_id}</td>
                  <td style={{ padding: "1rem", textTransform: "capitalize" }}>{c.category}</td>
                  <td style={{ padding: "1rem" }}>{c.location.ward}</td>
                  <td style={{ padding: "1rem" }}>
                    <span className="status-badge" style={{ 
                      background: c.state === 'DISPUTE' ? 'rgba(245, 158, 11, 0.2)' : c.state === 'ESCALATED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                      color: c.state === 'DISPUTE' ? '#fcd34d' : c.state === 'ESCALATED' ? '#fca5a5' : '#c4b5fd',
                      border: `1px solid ${c.state === 'DISPUTE' ? '#f59e0b' : c.state === 'ESCALATED' ? '#ef4444' : '#8b5cf6'}`
                    }}>
                      {c.state}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", color: isBreached ? "#fca5a5" : "#6ee7b7" }}>
                      <Clock size={14} />
                      <span style={{ fontSize: "0.9rem", fontWeight: isBreached ? "bold" : "normal" }}>
                        {new Date(c.sla.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <Link href={`/cases/${c.case_id}`} style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem" }}>
                      View Details →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
