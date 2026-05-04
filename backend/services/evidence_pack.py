from datetime import datetime
from typing import Optional

def _risk_label(score):
    if score >= 80: return 'LOW'
    if score >= 60: return 'MEDIUM'
    if score >= 40: return 'HIGH'
    return 'CRITICAL'

def _risk_color(score):
    if score >= 80: return '#3FB950'
    if score >= 60: return '#F97316'
    if score >= 40: return '#D29922'
    return '#F85149'

def generate_evidence_pack_html(model_name, model_type, model_id, trust_score, risk_level, last_audited, audit, compliance, org_name='AI Sheriff'):
    generated_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
    risk_color = _risk_color(trust_score)

    audit_section = ''
    if audit:
        pass_rate = round(audit['passed'] / audit['total_tests'] * 100, 1) if audit.get('total_tests', 0) > 0 else 0
        audit_section = f"""
<section class="section"><h2>3. Adversarial Audit Results</h2>
<div class="grid-3">
  <div class="stat-box"><div class="stat-num">{audit.get('total_tests',0)}</div><div class="stat-label">Total Tests</div></div>
  <div class="stat-box green"><div class="stat-num">{audit.get('passed',0)}</div><div class="stat-label">Passed</div></div>
  <div class="stat-box red"><div class="stat-num">{audit.get('failed',0)}</div><div class="stat-label">Failed</div></div>
</div>
<table><thead><tr><th>Category</th><th>Score</th><th>Status</th></tr></thead><tbody>
<tr><td>Bias &amp; Fairness</td><td>{audit.get('bias_score',0):.1f}%</td><td class="{'pass' if audit.get('bias_score',0)>=70 else 'fail'}">{_risk_label(audit.get('bias_score',0))}</td></tr>
<tr><td>Hallucination Resistance</td><td>{audit.get('hallucination_score',0):.1f}%</td><td class="{'pass' if audit.get('hallucination_score',0)>=70 else 'fail'}">{_risk_label(audit.get('hallucination_score',0))}</td></tr>
<tr><td>Toxicity Shield</td><td>{audit.get('toxicity_score',0):.1f}%</td><td class="{'pass' if audit.get('toxicity_score',0)>=70 else 'fail'}">{_risk_label(audit.get('toxicity_score',0))}</td></tr>
<tr><td>Jailbreak Resistance</td><td>{audit.get('jailbreak_resistance',0):.1f}%</td><td class="{'pass' if audit.get('jailbreak_resistance',0)>=70 else 'fail'}">{_risk_label(audit.get('jailbreak_resistance',0))}</td></tr>
</tbody></table>
<p class="note">Pass rate: {pass_rate}% ({audit.get('passed',0)} of {audit.get('total_tests',0)} tests). Red-teaming powered by Claude AI (Anthropic).</p>
</section>"""

    compliance_section = ''
    if compliance:
        gaps = compliance.get('gaps', [])
        gaps_html = ''.join(f'<li>{g}</li>' for g in gaps) if gaps else '<li>No critical gaps.</li>'
        recs = compliance.get('framework_details', {}).get('recommendations', [])
        recs_html = ''.join(f'<li>{r}</li>' for r in recs) if recs else '<li>Continue regular audits.</li>'
        compliance_section = f"""
<section class="section"><h2>4. Regulatory Compliance</h2>
<table><thead><tr><th>Framework</th><th>Score</th><th>Status</th><th>Jurisdiction</th></tr></thead><tbody>
<tr><td>EU AI Act</td><td>{compliance.get('eu_ai_act_score',0):.1f}/100</td><td class="{'pass' if compliance.get('eu_ai_act_score',0)>=70 else 'fail'}">{_risk_label(compliance.get('eu_ai_act_score',0))}</td><td>European Union · Aug 2026 deadline</td></tr>
<tr><td>NIST AI RMF</td><td>{compliance.get('nist_rmf_score',0):.1f}/100</td><td class="{'pass' if compliance.get('nist_rmf_score',0)>=70 else 'fail'}">{_risk_label(compliance.get('nist_rmf_score',0))}</td><td>United States Federal</td></tr>
<tr><td>India DPDP Act</td><td>{compliance.get('india_dpdp_score',0):.1f}/100</td><td class="{'pass' if compliance.get('india_dpdp_score',0)>=70 else 'fail'}">{_risk_label(compliance.get('india_dpdp_score',0))}</td><td>India Data Protection</td></tr>
<tr style="font-weight:700"><td>Overall</td><td>{compliance.get('overall_compliance',0):.1f}/100</td><td class="{'pass' if compliance.get('overall_compliance',0)>=70 else 'fail'}">{_risk_label(compliance.get('overall_compliance',0))}</td><td>Cross-jurisdictional</td></tr>
</tbody></table>
<h3>Compliance Gaps</h3><ul class="gap-list">{gaps_html}</ul>
<h3>Recommendations</h3><ul class="rec-list">{recs_html}</ul>
</section>"""

    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>AI Sheriff Evidence Pack — {model_name}</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:Georgia,serif;color:#1a1a2e;background:#fff;font-size:13px;line-height:1.6}}
.page{{max-width:800px;margin:0 auto;padding:40px 50px}}.header{{border-bottom:3px solid #F97316;padding-bottom:24px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-start}}
.logo-text{{font-size:22px;font-weight:700;color:#0D1117;font-family:sans-serif}}.logo-text span{{color:#F97316}}.doc-meta{{text-align:right;font-size:11px;color:#666;font-family:sans-serif}}
.doc-meta strong{{display:block;font-size:14px;color:#0D1117;margin-bottom:4px}}.hero{{background:#f8f9fa;border:1px solid #e0e0e0;border-left:5px solid {risk_color};border-radius:4px;padding:20px 24px;margin-bottom:28px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}}
.hero-item{{text-align:center}}.hero-val{{font-size:28px;font-weight:700;color:{risk_color};font-family:sans-serif}}.hero-label{{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#666;margin-top:2px;font-family:sans-serif}}
h2{{font-size:15px;color:#0D1117;margin:28px 0 12px;font-family:sans-serif;border-bottom:1px solid #e8e8e8;padding-bottom:6px}}h3{{font-size:13px;color:#333;margin:16px 0 8px;font-family:sans-serif}}
.section{{margin-bottom:28px}}table{{width:100%;border-collapse:collapse;margin:12px 0;font-family:sans-serif;font-size:12px}}
th{{background:#f0f0f0;text-align:left;padding:8px 10px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;border:1px solid #ddd}}
td{{padding:8px 10px;border:1px solid #e8e8e8}}tr:nth-child(even) td{{background:#fafafa}}.pass{{color:#2d7a2d;font-weight:700;font-size:10px;text-transform:uppercase}}.fail{{color:#c0392b;font-weight:700;font-size:10px;text-transform:uppercase}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}}.stat-box{{border:1px solid #ddd;border-radius:6px;padding:14px;text-align:center;font-family:sans-serif}}
.stat-box.green{{border-color:#2d7a2d;background:#f0fff0}}.stat-box.red{{border-color:#c0392b;background:#fff5f5}}.stat-num{{font-size:24px;font-weight:700;color:#0D1117}}.stat-box.green .stat-num{{color:#2d7a2d}}.stat-box.red .stat-num{{color:#c0392b}}
.stat-label{{font-size:10px;text-transform:uppercase;color:#666;margin-top:3px}}.note{{font-size:11px;color:#666;font-style:italic;margin-top:8px;background:#fafafa;padding:8px 12px;border-left:3px solid #ccc}}
.gap-list li{{color:#c0392b;margin:4px 0 4px 16px;font-size:12px;font-family:sans-serif}}.rec-list li{{color:#1a5276;margin:4px 0 4px 16px;font-size:12px;font-family:sans-serif}}
.cert-box{{border:2px solid {risk_color};border-radius:8px;padding:20px;text-align:center;margin:24px 0;background:{'#f0fff4' if trust_score>=70 else '#fff5f5'};font-family:sans-serif}}
.cert-title{{font-size:16px;font-weight:700;color:{risk_color};margin-bottom:6px}}.cert-sub{{font-size:11px;color:#666}}
.footer{{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#999;font-family:sans-serif;display:flex;justify-content:space-between}}
</style></head><body><div class="page">
<div class="header"><div><div class="logo-text">AI <span>Sheriff</span></div><div style="font-size:11px;color:#666;font-style:italic">Audit. Comply. Trust.</div></div>
<div class="doc-meta"><strong>REGULATORY EVIDENCE PACK</strong>Doc ID: SHERIFF-EP-{model_id[:8].upper()}<br>Generated: {generated_at}<br>Confidential</div></div>
<div class="hero">
<div class="hero-item"><div class="hero-val">{trust_score:.1f}</div><div class="hero-label">Trust Score /100</div></div>
<div class="hero-item"><div class="hero-val" style="color:{'#2d7a2d' if risk_level=='Low' else '#c0392b' if risk_level in ('Critical','High') else '#c87f0a'}">{risk_level.upper()}</div><div class="hero-label">Risk Level</div></div>
<div class="hero-item"><div class="hero-val" style="font-size:16px">{'✓ CERTIFIED' if trust_score>=70 else '✗ NOT CERTIFIED'}</div><div class="hero-label">Sheriff Status</div></div>
</div>
<section class="section"><h2>1. Document Purpose</h2><p>Generated by AI Sheriff for submission to regulatory bodies and enterprise procurement teams. Documents safety, fairness, and compliance status of the AI system below.</p></section>
<section class="section"><h2>2. AI System Metadata</h2>
<table><tbody>
<tr><td style="color:#666;width:160px">System Name</td><td><strong>{model_name}</strong></td></tr>
<tr><td style="color:#666">System Type</td><td>{model_type.replace('_',' ').title()}</td></tr>
<tr><td style="color:#666">System ID</td><td style="font-family:monospace;font-size:11px">{model_id}</td></tr>
<tr><td style="color:#666">Organisation</td><td>{org_name}</td></tr>
<tr><td style="color:#666">Last Audited</td><td>{last_audited or 'Not yet audited'}</td></tr>
<tr><td style="color:#666">Trust Score</td><td style="color:{risk_color};font-weight:700">{trust_score:.1f}/100</td></tr>
<tr><td style="color:#666">Risk Level</td><td style="color:{risk_color};font-weight:700">{risk_level}</td></tr>
</tbody></table></section>
{audit_section}
{compliance_section}
<div class="cert-box">
<div class="cert-title">{'✓ AI SHERIFF CERTIFIED — Meets minimum safety and compliance thresholds.' if trust_score>=70 else '✗ CERTIFICATION WITHHELD — Requires remediation before high-risk deployment.'}</div>
<div class="cert-sub">Trust Score: {trust_score:.1f}/100 · {risk_level} Risk · AI Sheriff v1.0 · {generated_at}</div>
</div>
<section class="section"><h2>5. Methodology</h2>
<p>Generated by AI Sheriff using: adversarial red-teaming (Claude AI), compliance mapping to EU AI Act / NIST RMF / DPDP Act, statistical drift detection.</p>
<p class="note">Auto-generated. Review with a qualified AI compliance officer before formal regulatory submission.</p>
</section>
<div class="footer"><span>AI Sheriff · aisheriff.com · Audit. Comply. Trust.</span><span>SHERIFF-EP-{model_id[:8].upper()} · {generated_at}</span></div>
</div></body></html>"""