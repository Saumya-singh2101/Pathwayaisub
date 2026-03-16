import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilder() {

  const resumeRef = useRef();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: [],
    education: [],
    projects: []
  });

  const [skillInput, setSkillInput] = useState("");

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setForm(prev => ({
      ...prev,
      skills: [...prev.skills, skillInput]
    }));

    setSkillInput("");
  };

  const addEducation = () => {
    setForm(prev => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", year: "" }]
    }));
  };

  const updateEducation = (index, field, value) => {
    const list = [...form.education];
    list[index][field] = value;

    setForm(prev => ({
      ...prev,
      education: list
    }));
  };

  const addProject = () => {
    setForm(prev => ({
      ...prev,
      projects: [...prev.projects, { title: "", desc: "" }]
    }));
  };

  const updateProject = (index, field, value) => {
    const list = [...form.projects];
    list[index][field] = value;

    setForm(prev => ({
      ...prev,
      projects: list
    }));
  };

  const generateSummary = () => {

    const summary =
      `Motivated student skilled in ${form.skills.join(", ")} with strong interest in technology and problem solving. Experienced in building projects and learning modern development tools.`;

    setForm(prev => ({ ...prev, summary }));
  };

  const downloadPDF = async () => {

    const canvas = await html2canvas(resumeRef.current);

    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    pdf.addImage(img, "PNG", 0, 0, 210, 297);

    pdf.save("resume.pdf");
  };

  return (

    <div style={{
      padding: 40,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 40
    }}>

      {/* FORM */}

      <div>

        <h2>AI Resume Builder</h2>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <textarea
          placeholder="Summary"
          value={form.summary}
          onChange={(e) => updateField("summary", e.target.value)}
        />

        <button onClick={generateSummary}>
          Generate AI Summary
        </button>

        <hr />

        <h3>Skills</h3>

        <input
          placeholder="Skill"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
        />

        <button onClick={addSkill}>Add</button>

        {form.skills.map((s, i) => (
          <p key={i}>{s}</p>
        ))}

        <hr />

        <h3>Education</h3>

        <button onClick={addEducation}>
          Add Education
        </button>

        {form.education.map((e, i) => (

          <div key={i}>

            <input
              placeholder="School"
              value={e.school}
              onChange={(ev) => updateEducation(i, "school", ev.target.value)}
            />

            <input
              placeholder="Degree"
              value={e.degree}
              onChange={(ev) => updateEducation(i, "degree", ev.target.value)}
            />

            <input
              placeholder="Year"
              value={e.year}
              onChange={(ev) => updateEducation(i, "year", ev.target.value)}
            />

          </div>

        ))}

        <hr />

        <h3>Projects</h3>

        <button onClick={addProject}>
          Add Project
        </button>

        {form.projects.map((p, i) => (

          <div key={i}>

            <input
              placeholder="Title"
              value={p.title}
              onChange={(ev) => updateProject(i, "title", ev.target.value)}
            />

            <textarea
              placeholder="Description"
              value={p.desc}
              onChange={(ev) => updateProject(i, "desc", ev.target.value)}
            />

          </div>

        ))}

        <hr />

        <button onClick={downloadPDF}>
          Download Resume PDF
        </button>

      </div>

      {/* PREVIEW */}

      <div
        ref={resumeRef}
        style={{
          background: "white",
          padding: 30,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >

        <h1>{form.name || "Your Name"}</h1>

        <p>{form.email} | {form.phone}</p>

        <h3>Summary</h3>
        <p>{form.summary}</p>

        <h3>Skills</h3>

        <ul>
          {form.skills.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h3>Education</h3>

        {form.education.map((e, i) => (
          <p key={i}>
            {e.degree} — {e.school} ({e.year})
          </p>
        ))}

        <h3>Projects</h3>

        {form.projects.map((p, i) => (

          <div key={i}>
            <b>{p.title}</b>
            <p>{p.desc}</p>
          </div>

        ))}

      </div>

    </div>

  );
}