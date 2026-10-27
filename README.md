# 🛡️ MirageGate: The Honeypot That Learns Who's Lying
### Adaptive Deceptive Authentication & Behavioral Probation Sandbox SOC

> **IOTA X Enigma Hackathon — Cybersecurity Track (Problem Statement #2)**  
> **Team Name:** Shadow Coders  
> **Repository:** [github.com/harshith-bytes/enigma_hackathon_oct_26](https://github.com/harshith-bytes/enigma_hackathon_oct_26)

---

## 👥 Team Shadow Coders
* **Harshith Sai** — *Team Leader*
* **Anas Hisham** — *Team Member*
* **Divya Charan** — *Team Member*
* **Aditya Sharma** — *Team Member*

---

## 🚨 The Problem
Traditional authentication systems rely on static lockout rules (*"Lock account after 5 failed attempts"*). This binary approach fails modern cybersecurity defenders in three ways:
1. **Hurts Real Users:** Genuine employees who forget or mistype their password get locked out, causing frustration and helpdesk overload.
2. **Fails Against Patient Bots:** Attackers use low-and-slow, distributed credential-stuffing bots that stay just beneath static rate-limit thresholds.
3. **Zero Threat Intelligence:** Returning `HTTP 403 Blocked` immediately tips off the attacker to rotate proxies/IPs while giving defenders zero visibility into the attacker's post-login tools, scripts, or strategy.

---

## 💡 Our Solution: Probation by Deception
Instead of hard-blocking failed or suspicious logins at the gate, **MirageGate** uses real-time behavioral telemetry and **Silent Sandbox Probation**:

1. **Zero-Lockout Deceptive Login Gate:**
   * If a user enters the correct password (`BlueFalcon2026!`) with organic human keystroke cadence, they go straight to the **Original Real Website (`REAL_VAULT`)**.
   * If a user enters a **wrong password** OR exhibits bot-like typing/pasting cadence, MirageGate **does not block them**. It returns a deceptive `HTTP 200 OK` and silently routes the session into a **Fake Probation Website (`FAKE_SANDBOX`)**.

2. **3 Visual Canary Clues (Helping Misplaced Humans Recover):**
   How does a legitimate employee who made a typo realize they are in the Fake Website while an external attacker has no clue? We embed **3 subtle visual discrepancies**:
   * **Clue #1 (Wrong Personal Security Seal):** Displays `🦊 Orange Fox (Unverified Node)` in amber instead of the employee's true `🦅 Blue Falcon` emerald security seal.
   * **Clue #2 (Unfamiliar Context & Decoy Bait):** Displays `"Last Login: 03:14 AM from Unknown Proxy (91.240.118.x)"` alongside 4 watermarked honey-files (`passwords_master_2026.xlsx`, `aws_production_keys.env`, `customer_pii_dump.sql`, `company_payroll_secret.pdf`).
   * **Clue #3 (Authorized Human Escape Hatch):** A misplaced human notices the wrong security seal and clicks **`"🛡️ This doesn't look like my vault — Re-verify Identity"`** (or performs 2 harmless navigation clicks without touching bait files). MirageGate clears their suspicion score and **automatically redirects them back to the Original Real Website**!

3. **Trapping & Fingerprinting the Attacker:**
   An attacker or automated script does not know what the real Security Seal looks like—they immediately attack the decoy honey-files! When they trigger bulk downloads, file encryption, or SQL injection, MirageGate **permanently locks them inside the Fake Website**, serves realistic fake success responses, and fingerprints their exact attacking tools.

---

## 🏗️ System Architecture & Kaggle Classifier Pipeline

```text
[Stage 1: Deceptive Login Gate (Keystroke Flight/Hold/Paste Telemetry)]
                                  │
       ┌──────────────────────────┴──────────────────────────┐
       ▼ (Correct Pass + Human Cadence)                      ▼ (Wrong Pass OR Bot Burst -> Fake HTTP 200 OK)
[Original Real Website]                            [Fake Probation Sandbox (🦊 Orange Fox + 4 Honey-Files)]
 (🦅 Blue Falcon Vault)                                      │
       ▲                                                     ├──► [3-Model Behavioral Inference Engine]
       │                                                     │     1. CMU Keystroke Dynamics Classifier
       │ (0 Bait Touches + Re-verify Identity)               │     2. CIC-IDS-2017 Web Attack Classifier
       └─────────────────────────────────────────────────────┤     3. CERT Insider/Ransomware Detector
                                                             │
                                                             ▼ (Touches Bait: Exfil / Encrypt / SQLi)
                                              [Permanent Honeypot Containment + Tool Fingerprinter]
                                                             │
                                                             ▼
                                              [AES-256-GCM + SHA-256 Hash-Chained Forensic Ledger]
