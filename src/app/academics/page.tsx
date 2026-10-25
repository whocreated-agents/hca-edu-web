'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

type StageKey = 'pre-primary' | 'primary' | 'middle' | 'secondary';

interface StageInfo {
  title: string;
  badge: string;
  ageBand: string;
  classes: string;
  curriculum: string;
  subjects: string[];
  features: string[];
}

const STAGES: Record<StageKey, StageInfo> = {
  'pre-primary': {
    title: 'Pre-Primary Foundation (Nursery, LKG, HKG)',
    badge: 'Ages 3 to 5',
    ageBand: 'Minimum 3 years completed as of 31 July for Nursery',
    classes: 'Nursery · Lower Kindergarten (LKG) · Higher Kindergarten (HKG)',
    curriculum: 'Activity-based foundational literacy and numeracy following child psychology guidelines.',
    subjects: ['English Phonics & Early Reading', 'Hindi Swar & Vyanjan', 'Number Concepts & Counting (1-100)', 'General Awareness & Environmental Senses', 'Rhymes, Storytelling & Moral Values', 'Freehand Drawing, Coloring & Craft'],
    features: [
      'Low teacher-to-child ratio for individual care',
      'Non-stressful evaluation without formal pen-and-paper exams',
      'Tactile wooden learning blocks and educational toys',
      'Daily circle time building social confidence and polite manners',
    ],
  },
  primary: {
    title: 'Primary School (Class I to V)',
    badge: 'Ages 6 to 10',
    ageBand: '6 years completed for Class I entrance',
    classes: 'Class I · Class II · Class III · Class IV · Class V',
    curriculum: 'RBSE structured primary curriculum cultivating foundational bilingual reading, scientific reasoning, and mental arithmetic.',
    subjects: ['English (Grammar, Prose & Composition)', 'Hindi (Vyakaran & Sahitya)', 'Mathematics (Arithmetic, Geometry & Word Problems)', 'Environmental Studies (EVS / Vigyan-Samaj)', 'Basic Computer Science (Hands-on Lab)', 'General Knowledge & Moral Education'],
    features: [
      'Daily cursive handwriting and vernacular reading practice',
      'Weekly computer laboratory practical sessions',
      'Periodic unit tests every 6 weeks for early mastery checks',
      'Physical education, yoga, and athletic field games',
    ],
  },
  middle: {
    title: 'Middle School (Class VI to VIII)',
    badge: 'Ages 11 to 13',
    ageBand: '11 years completed for Class VI',
    classes: 'Class VI · Class VII · Class VIII',
    curriculum: 'RBSE Middle School syllabus bridging conceptual foundations with systematic science practicals and third language immersion.',
    subjects: ['Science (Physics, Chemistry, Biology Foundations)', 'Mathematics (Algebra, Practical Geometry, Data)', 'Social Science (History, Geography, Civics of Rajasthan & India)', 'English Language & Literature', 'Hindi Vyakaran & Literature', 'Sanskrit (Third Language Mandatory)', 'Information & Communication Technology (ICT)'],
    features: [
      'Laboratory experiments and science project exhibitions',
      'Debating, poetry recitation, and essay competitions',
      'RBSE Class VIII Board evaluation pattern orientation',
      'Dedicated guidance in mathematics problem-solving',
    ],
  },
  secondary: {
    title: 'Secondary Board Wing (Class IX & X)',
    badge: 'Ages 14 to 15',
    ageBand: 'RBSE Board Examination Cohort',
    classes: 'Class IX · Class X (Secondary Board Year)',
    curriculum: 'Strict Rajasthan Board of Secondary Education (RBSE) syllabus culminating in the Class X State Board Examination.',
    subjects: ['Mathematics (Standard Board Syllabus)', 'Science (Theoretical & Practical Physics, Chemistry, Biology)', 'Social Science (National History, Democratic Politics, Economics)', 'English (Compulsory Paper)', 'Hindi (Compulsory Paper)', 'Third Language (Sanskrit / Urdu)', 'Socially Useful Productive Work (SUPW) & Physical Training'],
    features: [
      'Intensive Board preparatory mock tests under actual exam conditions',
      'Detailed question bank analysis from past 10 years of RBSE papers',
      'Personal remedial coaching for students needing extra clarity',
      'Consistent 95%+ pass record with numerous distinction rankings',
    ],
  },
};

export default function AcademicsPage() {
  const [activeStage, setActiveStage] = useState<StageKey>('pre-primary');
  const stage = STAGES[activeStage];

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>14 Class Levels</span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-3)' }}>
              Academics &amp; Curriculum Framework
            </h1>
            <p className="subheading" style={{ maxWidth: '680px', margin: '0 auto' }}>
              Affiliated with the Rajasthan Board of Secondary Education (RBSE), Ajmer. From first steps in Nursery through secondary matriculation in Class X.
            </p>
          </div>

          {/* Stage Tabs (Keyboard accessible, semantic) */}
          <div
            role="tablist"
            aria-label="Academic Stages"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              justifyContent: 'center',
              marginBottom: 'var(--space-8)',
            }}
          >
            {(Object.keys(STAGES) as StageKey[]).map((key) => {
              const isActive = activeStage === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${key}`}
                  id={`tab-${key}`}
                  onClick={() => setActiveStage(key)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minHeight: '44px', textTransform: 'capitalize' }}
                >
                  {key.replace('-', ' ')} ({STAGES[key].badge})
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div
            role="tabpanel"
            id={`panel-${activeStage}`}
            aria-labelledby={`tab-${activeStage}`}
            className="card-elevated"
            style={{ marginBottom: 'var(--space-12)' }}
          >
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>{stage.badge}</span>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>{stage.title}</h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Classes: <strong>{stage.classes}</strong></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Eligibility Baseline</span>
                <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--hca-brand-primary-800)' }}>{stage.ageBand}</strong>
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--line-height-relaxed)' }}>
              {stage.curriculum}
            </p>

            <div className="grid-cols-2">
              <div className="card" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-3)', color: 'var(--hca-brand-primary-800)' }}>
                  Core Subjects &amp; Practical Areas
                </h3>
                <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                  {stage.subjects.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-3)', color: 'var(--hca-brand-accent-700)' }}>
                  Pedagogical Highlights &amp; Care
                </h3>
                <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                  {stage.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Academic Schedule & Timings */}
          <div className="grid-cols-2" style={{ marginBottom: 'var(--space-10)' }}>
            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-3)' }}>
                Daily School Timings
              </h3>
              <table className="data-table">
                <tbody>
                  <tr>
                    <td><strong>Summer Timing:</strong></td>
                    <td>7:30 AM – 1:00 PM (Monday to Saturday)</td>
                  </tr>
                  <tr>
                    <td><strong>Winter Timing:</strong></td>
                    <td>8:00 AM – 2:00 PM (Monday to Saturday)</td>
                  </tr>
                  <tr>
                    <td><strong>Morning Assembly:</strong></td>
                    <td>First 20 minutes (Prayer, News, Moral Pledge)</td>
                  </tr>
                  <tr>
                    <td><strong>Recess &amp; Lunch:</strong></td>
                    <td>25 minutes midday interval</td>
                  </tr>
                  <tr>
                    <td><strong>Office Hours:</strong></td>
                    <td>8:00 AM – 2:30 PM (Working days)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-3)' }}>
                Evaluation &amp; Examination Pattern
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                In strict compliance with RBSE norms, student performance is assessed through regular continuous evaluation:
              </p>
              <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                <li><strong>Periodic Tests:</strong> Conducted in July and November.</li>
                <li><strong>Half-Yearly Examination:</strong> Comprehensive assessment in December.</li>
                <li><strong>Annual Examination:</strong> Summative board/school examination in March.</li>
                <li><strong>Parent-Teacher Conferences:</strong> Follow every examination round.</li>
              </ul>
            </div>
          </div>

          {/* Bottom Enquiry Banner */}
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', backgroundColor: 'var(--hca-brand-primary-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--hca-brand-primary-100)' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
              Ready to Discuss Admission for Your Child?
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Enquiries for the upcoming academic session are open across all 14 class levels.
            </p>
            <Link href="/admissions/enquiry" className="btn btn-accent btn-lg">
              Submit 2-Minute Admission Enquiry →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
