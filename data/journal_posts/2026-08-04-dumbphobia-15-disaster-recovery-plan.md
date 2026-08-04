---
title: DumbPhobia#015 Disaster Recovery Plan
date: 2026-08-04
tags: [system]
image: /assets/post-covers/disaster-recovery-plan.webp
---

# 1. Disaster Recovery Planning: How a Business Survives IT Disasters

A **Disaster Recovery Plan**, commonly called a **DRP**, is a documented technical process for restoring IT systems, applications, infrastructure, and data after a serious disruption.

A DRP does not necessarily prevent a disaster from happening. Its purpose is to reduce the impact of the disaster and help the business continue operating or return to normal operations as quickly as possible.

A good DRP should clearly answer questions such as:

* Who is responsible for detecting the incident?
* Who declares that a disaster has occurred?
* Who restores the systems and data?
* Which systems must be restored first?
* Who communicates with clients and stakeholders?
* How long can the business operate without each system?
* How much data can the business afford to lose?

## What Is Considered a Disaster?

In IT, a disaster is any event that causes major disruption to systems, services, infrastructure, or business operations.

Examples include:

* Server or storage failure
* Database corruption
* Ransomware or malware attacks
* Accidental data deletion
* Cloud service outages
* Network failure
* Power outages
* Fire, flooding, or natural disasters
* Failed software deployments
* Human error
* Unauthorized access
* Loss of an office or data center

Not every technical incident is a disaster. A minor application bug may be handled through normal incident management. A disaster usually requires special recovery procedures because normal operations cannot continue.

---

# 2. Backup vs. DRP vs. BCP

Backup, Disaster Recovery Planning, and Business Continuity Planning are related, but they are not the same.

## 2.1. Backup

A **backup** is a copy of data that can be used to restore the original data after it is lost, damaged, corrupted, or deleted.

Examples include:

* Database dumps
* File-system snapshots
* Virtual-machine snapshots
* Cloud storage copies
* Transaction log backups
* Application configuration backups

A backup answers the question:

> Where can we recover our data from?

However, having backups alone does not guarantee that the business can recover successfully. The backups may be corrupted, outdated, inaccessible, or incomplete.

---

## 2.2. Disaster Recovery Plan

A **Disaster Recovery Plan** describes how the organization restores its technical environment after a disaster.

It covers areas such as:

* Infrastructure recovery
* Database restoration
* Application deployment
* Network reconfiguration
* Security validation
* Recovery responsibilities
* Communication procedures
* Recovery priorities
* Recovery testing

A DRP answers the question:

> How will we restore our IT systems after a disaster?

---

## 2.3. Business Continuity Plan

A **Business Continuity Plan**, or **BCP**, describes how the organization continues critical business operations during and after a disruption.

It may include technical recovery, but it also covers areas outside IT, such as:

* Alternative workplaces
* Manual business processes
* Customer support procedures
* Employee communication
* Supplier management
* Financial operations
* Legal and regulatory obligations
* Public communication

A BCP answers the question:

> How will the business continue operating while systems are unavailable?

---

## 2.4. Comparison

| Area                               | Backup                  | DRP                            | BCP                         |
| ---------------------------------- | ----------------------- | ------------------------------ | --------------------------- |
| Primary focus                      | Data copies             | IT system recovery             | Business survival           |
| Main question                      | Where is the data copy? | How do we restore IT services? | How do operations continue? |
| Covers infrastructure              | Partially               | Yes                            | Sometimes                   |
| Covers employees and clients       | No                      | Partially                      | Yes                         |
| Includes recovery responsibilities | Usually limited         | Yes                            | Yes                         |
| Requires testing                   | Yes                     | Yes                            | Yes                         |
| Scope                              | Narrow                  | Technical                      | Organization-wide           |

Backups are a component of a DRP, while the DRP is usually a component of the broader BCP.

---

# 3. Key Components of a Disaster Recovery Plan

## 3.1. Asset Inventory

The first step is identifying everything that must be protected and recovered.

An asset inventory may include:

* Physical servers
* Virtual machines
* Cloud resources
* Databases
* File storage
* Source-code repositories
* Network devices
* Firewalls
* DNS configurations
* SSL certificates
* Application services
* Authentication systems
* Third-party integrations
* API credentials
* Environment variables
* Infrastructure-as-code files
* Employee devices
* Monitoring systems
* Backup systems

For each asset, the organization should record:

| Field               | Description                                   |
| ------------------- | --------------------------------------------- |
| Asset name          | Name of the system or service                 |
| Owner               | Person or team responsible                    |
| Location            | Cloud, office, data center, or provider       |
| Business purpose    | Why the asset is required                     |
| Dependencies        | Other systems needed for operation            |
| Data classification | Public, internal, confidential, or restricted |
| Recovery priority   | Critical, high, medium, or low                |
| Backup method       | How the asset is protected                    |
| Recovery procedure  | How the asset will be restored                |

The inventory should also identify the order in which systems must be recovered.

For example:

1. Network and security infrastructure
2. Identity and authentication systems
3. Primary databases
4. Core backend services
5. Customer-facing applications
6. Internal management systems
7. Reporting and analytics systems

Recovering systems in the wrong order may cause additional delays. For example, restoring a web application before restoring its database and authentication provider may not produce a usable service.

---

## 3.2. Business Impact Analysis

A **Business Impact Analysis**, or **BIA**, evaluates what happens when a system becomes unavailable.

The analysis should identify:

* Revenue loss
* Operational disruption
* Customer impact
* Legal consequences
* Regulatory consequences
* Reputational damage
* Data-loss impact
* Employee productivity loss
* Dependency failures

A simple impact classification may look like this:

| Priority | Description                                  | Example            |
| -------- | -------------------------------------------- | ------------------ |
| Critical | Business cannot operate without it           | Payment system     |
| High     | Major impact but temporary workarounds exist | Customer portal    |
| Medium   | Limited operational disruption               | Internal reporting |
| Low      | Minimal immediate impact                     | Archived analytics |

The BIA helps determine which systems need the strictest recovery targets.

---

## 3.3. RTO and RPO Goals

Two of the most important values in disaster recovery are **RTO** and **RPO**.

### 3.3.1. Recovery Time Objective

The **Recovery Time Objective**, or **RTO**, is the maximum acceptable time that a system can remain unavailable.

For example:

```text
RTO = 4 hours
```

This means the organization aims to restore the system within four hours after the disaster is declared.

The RTO measures acceptable downtime.

---

### 3.3.2. Recovery Point Objective

The **Recovery Point Objective**, or **RPO**, is the maximum acceptable amount of data loss measured in time.

For example:

```text
RPO = 15 minutes
```

This means the organization should be able to restore the system to a state no more than 15 minutes before the incident.

The RPO determines how frequently data must be backed up or replicated.

---

### 3.3.3. RTO and RPO Example

Suppose a database server fails at 14:00.

The organization has:

```text
RTO = 2 hours
RPO = 15 minutes
```

The goals are:

* Restore the database by 16:00.
* Restore data to at least the state it was in at 13:45.

The RTO does not define how much data may be lost. The RPO does not define how long recovery may take. Both values are required.

---

### 3.3.4. Example Recovery Targets

| System               |        RTO |       RPO | Priority |
| -------------------- | ---------: | --------: | -------- |
| Payment database     | 30 minutes |  1 minute | Critical |
| Customer application |     1 hour | 5 minutes | Critical |
| Internal HR system   |    8 hours |  24 hours | Medium   |
| Analytics platform   |   24 hours |  24 hours | Low      |
| Archived documents   |   72 hours |    7 days | Low      |

Lower RTO and RPO values usually require more advanced and expensive infrastructure.

For example, an RPO of one minute may require:

* Continuous replication
* Database transaction-log shipping
* Change data capture
* Multi-region storage
* High-availability database clusters

---

# 4. Backup Strategy

A backup strategy defines how data is copied, stored, protected, verified, and restored.

It should answer the following questions:

* What type of backup is used?
* Where are backups stored?
* How frequently are backups created?
* How long are they retained?
* Who is responsible for monitoring them?
* How are backups encrypted?
* How are failed backups detected?
* How are backups tested?
* Who is authorized to restore them?

---

## 4.1. Backup Types

### 4.1.1. Full Backup

A full backup creates a complete copy of the selected data.

Advantages:

* Simple restoration
* Complete recovery point
* Fewer dependencies during restoration

Disadvantages:

* Requires more storage
* Takes longer to create
* Consumes more network bandwidth

Example:

```text
Full backup every month
```

---

### 4.1.2. Incremental Backup

An incremental backup stores only changes made since the previous backup.

Advantages:

* Smaller backup size
* Faster backup process
* Reduced bandwidth usage

Disadvantages:

* Restoration may require multiple backup files
* A missing or corrupted incremental backup can affect recovery

Example:

```text
Full backup on Sunday
Incremental backups Monday through Saturday
```

---

### 4.1.3. Differential Backup

A differential backup stores all changes made since the most recent full backup.

Advantages:

* Faster restoration than a long incremental chain
* Requires only the full backup and latest differential backup

Disadvantages:

* Differential backups grow larger over time
* Uses more storage than incremental backups

---

### 4.1.4. Snapshot

A snapshot records the state of a disk, volume, virtual machine, or database at a specific point in time.

Snapshots are useful for:

* Fast rollback
* Virtual-machine recovery
* Storage-volume recovery
* Pre-deployment protection

However, a snapshot stored on the same infrastructure is not always a reliable disaster recovery backup. If the entire storage system fails, both the original data and snapshot may be lost.

---

### 4.1.5. Transaction Log Backup

Transaction log backups capture database changes between full or incremental backups.

They support point-in-time recovery.

For example:

```text
Full database backup: monthly
Incremental backup: daily
Transaction log backup: every 1–5 minutes
```

If the database fails at 10:37, transaction logs may allow restoration to 10:36 or another precise recovery point.

---

## 4.2. Example Backup Schedule

A practical production backup strategy might use:

```text
Monthly full baseline backup
Daily incremental backup
Hourly application-data backup
Transaction logs every 1–5 minutes
Pre-deployment snapshot before major releases
```

Example schedule:

| Backup type               | Frequency       | Retention |
| ------------------------- | --------------- | --------- |
| Full baseline             | Monthly         | 12 months |
| Incremental backup        | Daily           | 30 days   |
| Database transaction logs | Every 5 minutes | 7 days    |
| Weekly archive            | Weekly          | 3 months  |
| Annual archive            | Annually        | 7 years   |
| Pre-deployment snapshot   | Before release  | 14 days   |

Retention periods should be based on:

* Business requirements
* Legal requirements
* Data size
* Storage costs
* Security requirements
* Audit obligations

---

## 4.3. Backup Location

Backups should not all be stored in the same location as the production systems.

Possible backup locations include:

* Separate physical storage
* Secondary data center
* Cloud object storage
* Another cloud region
* Offline storage
* Immutable storage
* Encrypted removable media

A common guideline is the **3-2-1 backup rule**:

```text
3 copies of the data
2 different storage media
1 copy stored off-site
```

A stronger model for ransomware protection is sometimes expressed as:

```text
3 copies
2 storage types
1 off-site copy
1 offline or immutable copy
0 unverified backup errors
```

---

## 4.4. Backup Security

Backups frequently contain sensitive production information. They must be protected as carefully as the production systems.

Important controls include:

* Encryption at rest
* Encryption in transit
* Restricted access
* Multi-factor authentication
* Separate backup credentials
* Immutable retention policies
* Audit logging
* Key-management procedures
* Regular integrity validation
* Separation from the production network

Backup credentials should not be identical to production administrator credentials. Otherwise, an attacker who compromises production may also delete or encrypt the backups.

---

## 4.5. Backup Responsibility

Every backup process should have a clearly assigned owner.

Example responsibility table:

| Task                       | Responsible role            |
| -------------------------- | --------------------------- |
| Configure database backups | Database administrator      |
| Monitor backup jobs        | Operations engineer         |
| Review failed backups      | On-call engineer            |
| Approve restoration        | Incident commander          |
| Restore database           | Database administrator      |
| Restore infrastructure     | Infrastructure team         |
| Validate application       | Application owner           |
| Audit backup compliance    | Security or compliance team |

Automation is important, but automated backups still require human ownership.

---

# 5. Recovery Procedures

The DRP must contain detailed recovery instructions.

The procedures should be specific enough that an authorized engineer who did not design the original system can still perform the recovery.

A recovery procedure may include:

1. Confirm that the incident qualifies as a disaster.
2. Declare the disaster and activate the DRP.
3. Assign an incident commander.
4. Protect remaining systems from further damage.
5. Identify the latest valid recovery point.
6. Prepare replacement infrastructure.
7. Restore network and security configurations.
8. Restore identity and authentication services.
9. Restore databases.
10. Restore application services.
11. Restore files and external integrations.
12. Validate data integrity.
13. Perform security checks.
14. Conduct application testing.
15. Redirect users or DNS traffic.
16. Inform customers that services are restored.
17. Monitor the environment closely.
18. Document the incident and recovery results.

Commands, scripts, credentials, and configuration locations should be documented securely.

For example:

```bash
pg_restore \
  --host=recovery-db.internal \
  --username=postgres \
  --dbname=production_recovery \
  --no-owner \
  latest-backup.dump
```

The DRP should not include plain-text production passwords. Instead, it should explain how authorized staff can retrieve recovery credentials from a secure secret-management system.

---

# 6. Roles and Responsibilities

During a disaster, unclear responsibilities can cause more damage than the original incident.

The DRP should identify who performs each action.

## 6.1. Incident Detector

The incident may first be detected by:

* Monitoring systems
* Security tools
* Support staff
* Customers
* Developers
* Infrastructure engineers
* Third-party providers

The first detector should know:

* Where to report the issue
* What information to collect
* Who must be contacted
* What actions must not be taken

The person who first detects the incident may not be the person authorized to declare a disaster.

---

## 6.2. Incident Commander

The incident commander coordinates the recovery process.

Responsibilities may include:

* Declaring the disaster
* Activating the DRP
* Assigning recovery teams
* Approving major recovery decisions
* Tracking recovery progress
* Coordinating technical and business teams
* Ensuring communication is consistent
* Declaring the incident resolved

---

## 6.3.Technical Recovery Team

The technical team restores:

* Servers
* Cloud infrastructure
* Networks
* Databases
* Applications
* Storage
* Authentication services
* Monitoring services

Different specialists may be responsible for different recovery areas.

---

## 6.4. Data Recovery Owner

The data recovery owner is responsible for:

* Selecting the correct backup
* Confirming backup integrity
* Restoring databases and files
* Applying transaction logs
* Verifying the recovery point
* Checking for data corruption
* Documenting any data loss

---

## 6.5. Security Team

The security team determines whether the environment is safe to restore.

This is especially important after:

* Ransomware
* Unauthorized access
* Credential theft
* Malware infection
* Supply-chain attacks
* Data exfiltration

Restoring systems without removing the original threat may allow the attacker to compromise the environment again.

---

## 6.6. Communication Owner

The communication owner informs:

* Senior management
* Employees
* Clients
* Business partners
* Service providers
* Regulators
* Legal teams
* Public-relations teams

Technical teams should not independently send inconsistent information to customers.

---

## 6.7. Client Communication

Client communication should explain:

* What service is affected
* When the problem began
* What users should do
* Whether data may be affected
* What recovery actions are underway
* When the next update will be provided
* When service has been restored

Avoid making unsupported promises or assigning blame before the investigation is complete.

Example:

```text
We are currently investigating an interruption affecting access to the
customer portal. Our recovery procedures have been activated, and the
technical team is restoring the affected services.

Customer data remains under investigation. We will provide the next update
through the official status page.
```

---

# 7. Contact List

The DRP should contain an updated contact list.

It may include:

| Role                   | Primary contact | Secondary contact  | Communication method     |
| ---------------------- | --------------- | ------------------ | ------------------------ |
| Incident commander     | Name            | Backup person      | Phone and messaging      |
| Infrastructure lead    | Name            | Backup person      | Phone and email          |
| Database administrator | Name            | Backup person      | Phone and messaging      |
| Security lead          | Name            | Backup person      | Phone and secure channel |
| Application owner      | Name            | Backup person      | Phone and email          |
| Client communication   | Name            | Backup person      | Phone and email          |
| Cloud provider         | Support ID      | Escalation contact | Support portal           |
| Internet provider      | Account ID      | Escalation contact | Support line             |

The contact list should be available even when internal systems are unavailable.

Do not store the only copy of the DRP inside the system that may fail.

---

# 8. Recovery Testing

A DRP should never be considered complete until it has been tested.

The purpose of recovery testing is to confirm that:

* Backups can be accessed
* Backups are not corrupted
* Recovery procedures are accurate
* Team members understand their roles
* Credentials are available
* Infrastructure can be recreated
* Systems can meet RTO and RPO goals
* Dependencies are documented
* Restored applications function correctly

A successful backup notification does not prove that the backup can actually be restored.

---

## 8.1. Types of Recovery Tests

### 8.1.1. Backup Restoration Test

Restore selected files or databases into a temporary environment.

Example:

```text
Restore the latest database backup every month.
Run integrity checks.
Verify record counts.
Test critical application queries.
```

---

### 8.1.2. Tabletop Exercise

Team members discuss a simulated disaster and explain what they would do.

Example scenario:

```text
The primary production database has been encrypted by ransomware.
The cloud administrator account may also be compromised.
```

The team discusses:

* Who declares the disaster?
* Which systems are isolated?
* Which backup is safe?
* Who informs customers?
* How are credentials replaced?
* How is the clean recovery environment created?

---

### 8.1.3. Partial Failover Test

A selected service is moved to the recovery environment without affecting the entire production system.

This tests individual recovery components with lower operational risk.

---

### 8.1.4. Full Disaster Simulation

The organization simulates a complete failure and attempts to run systems from the disaster recovery environment.

This provides the strongest validation but also carries the greatest cost and risk.

---

## 8.2. Recovery Test Checklist

```markdown
- [ ] Latest backup located
- [ ] Backup checksum verified
- [ ] Recovery credentials available
- [ ] Replacement infrastructure created
- [ ] Database restored successfully
- [ ] Transaction logs applied
- [ ] Application deployed
- [ ] Authentication tested
- [ ] Critical workflows tested
- [ ] Security scan completed
- [ ] RTO measured
- [ ] RPO measured
- [ ] Recovery issues documented
- [ ] DRP updated
```

Every test should result in a written report.

The report should include:

* Test date
* Participants
* Scenario
* Systems tested
* Recovery time
* Recovery point
* Problems encountered
* Missing documentation
* Corrective actions
* Responsible owners
* Completion deadlines

---

# 9. Communication Plan

Communication should be planned before a disaster occurs.

The plan should define:

* Who communicates internally
* Who communicates externally
* Which channels are used
* How frequently updates are sent
* Who approves public statements
* Where customers can check status
* How regulators are contacted
* How communication continues if email is unavailable

Possible communication channels include:

* Phone
* SMS
* Secure messaging
* External status page
* Emergency email provider
* Video conference
* Internal chat
* Public website
* Social media

The organization should maintain an external communication channel that does not depend on the affected infrastructure.

---

# 10. Recovery Priority and Dependencies

Systems should be restored according to business priority and technical dependencies.

Consider the following dependency chain:

```text
Network
  ↓
DNS and security
  ↓
Identity provider
  ↓
Database
  ↓
Backend API
  ↓
Frontend application
  ↓
Reporting and analytics
```

Restoring the frontend before the API and database will not restore the business service.

A dependency map can be represented as follows:

| System          | Depends on               | Required by          |
| --------------- | ------------------------ | -------------------- |
| Customer portal | API, authentication, DNS | Customers            |
| Backend API     | Database, authentication | Customer portal      |
| Database        | Storage, network         | Backend API          |
| Authentication  | Directory, network       | All internal systems |
| Email service   | DNS, identity provider   | Staff communication  |

---

# 11. Example Incident Responsibility Matrix

A RACI matrix can make responsibilities clearer.

RACI means:

* **Responsible:** Performs the task
* **Accountable:** Owns the result
* **Consulted:** Provides input
* **Informed:** Receives updates

| Task                   | Incident Commander | Infrastructure | Database | Security | Client Support |
| ---------------------- | ------------------ | -------------- | -------- | -------- | -------------- |
| Detect incident        | I                  | R              | C        | R        | R              |
| Declare disaster       | A                  | C              | C        | C        | I              |
| Isolate systems        | A                  | R              | C        | R        | I              |
| Restore infrastructure | I                  | R/A            | C        | C        | I              |
| Restore database       | I                  | C              | R/A      | C        | I              |
| Validate security      | I                  | C              | C        | R/A      | I              |
| Inform clients         | A                  | I              | I        | C        | R              |
| Close incident         | A                  | C              | C        | C        | I              |

---

# 12. Disaster Recovery Lifecycle

A DRP is not a one-time document. It must evolve with the system.

A continuous DRP lifecycle includes:

```text
Identify assets
      ↓
Analyze business impact
      ↓
Define RTO and RPO
      ↓
Design backup and recovery strategy
      ↓
Document procedures
      ↓
Assign roles
      ↓
Test recovery
      ↓
Fix weaknesses
      ↓
Review after changes
      ↺
```

The plan should be reviewed after:

* Major application releases
* Infrastructure migrations
* Database changes
* New third-party integrations
* Security incidents
* Failed backup jobs
* Recovery tests
* Staff changes
* Regulatory changes
* Cloud-provider changes

---

# 13. Common DRP Mistakes

- **Assuming That Backups Equal Recover**: Backups are only useful when they can be restored successfully.

- **Storing Backups With Production**: A single ransomware attack or storage failure may destroy both.

- **Not Testing Restoration**: A backup job may report success while producing incomplete or corrupted files.

- **Missing Dependencies**: The team may restore the application but forget DNS, certificates, secrets, authentication, or external integrations.

- **Undefined Responsibilities**: Multiple people may assume someone else is handling recovery.

- **Outdated Contact Information**: The listed recovery owner may no longer work for the organization.

- **Unrealistic RTO and RPO**: An RTO of five minutes cannot be achieved with a manual restoration process that takes several hours.

- **No Client Communication Process**: Customers may receive delayed, inconsistent, or inaccurate information.

- **Restoring Compromised Systems**: After a security incident, restoring infected images, credentials, or backups may recreate the original compromise.

- **Keeping the DRP Only Online**: If the network, identity provider, or document system is unavailable, the recovery team may not be able to access the plan.

---

# 14. DRP Documentation Template

```markdown
# Disaster Recovery Plan

## 1. Document Information

- Organization:
- System:
- Plan owner:
- Version:
- Last updated:
- Last tested:
- Next review date:

## 2. Purpose

Describe the purpose and scope of the recovery plan.

## 3. Disaster Declaration Criteria

Define the conditions that activate the DRP.

## 4. Critical Assets

| Asset | Owner | Priority | RTO | RPO |
|---|---|---|---|---|

## 5. System Dependencies

Document infrastructure, database, network, identity, and vendor dependencies.

## 6. Backup Strategy

| Data | Backup type | Frequency | Location | Retention | Owner |
|---|---|---|---|---|---|

## 7. Recovery Roles

| Role | Primary contact | Backup contact | Responsibility |
|---|---|---|---|

## 8. Recovery Procedure

1. Detect and report the incident.
2. Assess the severity.
3. Declare the disaster.
4. Isolate affected systems.
5. Select the recovery point.
6. Restore infrastructure.
7. Restore databases and files.
8. Deploy applications.
9. Validate security.
10. Test critical workflows.
11. Redirect traffic.
12. Inform stakeholders.
13. Monitor restored services.

## 9. Communication Plan

Document internal, client, vendor, and regulatory communication procedures.

## 10. Validation Checklist

- [ ] Infrastructure available
- [ ] Database restored
- [ ] Data integrity confirmed
- [ ] Applications operational
- [ ] Authentication operational
- [ ] Security validation completed
- [ ] Monitoring operational
- [ ] Clients notified

## 11. Recovery Test History

| Test date | Scenario | Result | RTO achieved | RPO achieved | Issues |
|---|---|---|---|---|---|

## 12. Improvement Actions

| Issue | Corrective action | Owner | Deadline | Status |
|---|---|---|---|---|
```

---

# 15. Real-Life Examples: 
## 15.1 Maersk and the NotPetya Cyberattack

In June 2017, global shipping company **Maersk** was hit by the NotPetya malware. The attack spread across its network and destroyed access to servers, workstations, and Active Directory services. Shipping terminals and business operations around the world were disrupted. ([WIRED][1])

### What happened?

Maersk had backups for many individual servers, but its approximately 150 domain controllers synchronized with one another. When malware reached the network, the corrupted state spread across those controllers.

Without Active Directory, employees and systems could not authenticate, making it extremely difficult to restore other services.

The recovery team eventually discovered one unaffected domain controller in Ghana. A power outage had disconnected it from the network before the malware spread, leaving it as the only known surviving copy of Maersk’s Active Directory data. ([WIRED][1])

### How Maersk recovered

Maersk established a large emergency recovery operation involving hundreds of Maersk employees and external specialists. The recovery teams:

1. Isolated infected equipment.
2. Purchased and configured clean laptops.
3. Recovered the surviving domain controller.
4. Rebuilt the Active Directory environment.
5. Restored servers from available backups.
6. Reinstalled applications and business systems.
7. Gradually reconnected offices and shipping terminals.

The company reportedly rebuilt thousands of servers and tens of thousands of computers as part of the recovery operation. The incident cost Maersk an estimated **US$250–300 million**.

### DRP responsibilities

| Responsibility        | Example                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| First detection       | Employees and IT teams noticed systems failing                               |
| Disaster declaration  | Senior IT and business leadership activated emergency recovery               |
| Incident coordination | Central recovery teams coordinated the global response                       |
| Data restoration      | Infrastructure and Active Directory teams restored identity data and servers |
| Security validation   | Teams isolated old devices to prevent reinfection                            |
| Client communication  | Maersk informed customers about service and shipping disruptions             |
| Business continuity   | Some shipping operations continued using temporary and manual processes      |

### DRP lesson

Maersk’s recovery demonstrates that **replication is not the same as backup**.

Because all domain controllers were connected and synchronized, malware could affect all of them. A stronger DRP would include:

```text
Online replicated domain controllers
        +
Offline Active Directory backup
        +
Immutable off-site backup
        +
Regular full restoration tests
```

Critical identity systems must have isolated recovery copies. If authentication cannot be restored, many other systems cannot be recovered.

---

## 15.2 GitHub’s 2018 Database Incident

On October 21, 2018, GitHub experienced a network partition between its US East Coast network hub and its primary East Coast data center. The connectivity failure triggered database replication problems and caused inconsistent information to appear on GitHub.com.

The incident caused degraded service for **24 hours and 11 minutes**. GitHub reported that no user data was ultimately lost, although some database writes required manual reconciliation.

### What happened?

When network connectivity failed, some database replicas could not communicate with the primary database.

GitHub’s database system attempted to promote replicas so that services could continue operating. However, the promotion process created conflicting database states in different locations.

GitHub faced an important decision:

```text
Restore service quickly
        versus
Protect data consistency
```

Instead of immediately forcing all services back online, GitHub prioritized data integrity.

### How GitHub recovered

GitHub’s recovery process included:

1. Detecting the network and database failures.
2. Pausing webhook delivery and background processing.
3. Stopping writes to affected systems.
4. Evaluating which database replicas contained authoritative data.
5. Restoring database consistency.
6. Replicating validated data to healthy database servers.
7. Gradually enabling internal processing.
8. Restoring normal customer-facing operations.
9. Manually reconciling a small number of database writes.

GitHub deliberately disabled some features so that new activity would not create additional inconsistent records.

### DRP responsibilities

| Responsibility            | Example                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| First detection           | Automated monitoring and operations engineers detected connectivity failures |
| Incident coordination     | GitHub’s incident-response team coordinated recovery                         |
| Data restoration          | Database engineers identified and restored authoritative data                |
| Application recovery      | Service teams gradually restarted background jobs and features               |
| Data validation           | Engineers checked replication and reconciled conflicting writes              |
| Client communication      | GitHub published status updates and a post-incident report                   |
| Post-incident improvement | GitHub reviewed failover behavior and recovery procedures                    |

### DRP lesson

GitHub demonstrated that disaster recovery is not always about restoring the newest backup.

Sometimes the priority is determining:

* Which database contains the correct data
* Which writes were successfully committed
* Which replica should become authoritative
* Whether background jobs can safely restart
* Whether customers are seeing stale or inconsistent information

A proper database DRP must therefore include:

```markdown
- Database failover procedures
- Read-only emergency mode
- Replication health checks
- Authoritative-data selection rules
- Transaction reconciliation procedures
- Background-job shutdown procedures
- Incremental service restoration
```

---

# 16. Final Principles

A reliable Disaster Recovery Plan should be:

* Documented
* Prioritized
* Tested
* Accessible
* Secure
* Measurable
* Regularly updated
* Assigned to specific people
* Aligned with business requirements

The core idea is simple:

> A Disaster Recovery Plan does not guarantee that disasters will never happen. It ensures that the organization knows how to respond, restore critical systems, protect its data, communicate with clients, and survive the disruption.

A backup protects data. A DRP restores technology. A BCP keeps the business operating.

All three are necessary for a resilient organization.

# References

1. [The Untold Story of NotPetya, the Most Devastating Cyberattack in History](https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/?utm_source=chatgpt.com)
2. [October 21 post-incident analysis](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/?utm_source=chatgpt.com)
