---
title: DumbPhobia#016 ADAS: From Driver Assistance to Fully Autonomous Driving
date: 2026-08-14
tags: [system]
image: /assets/post-covers/ADAS-Working.png
---

Modern vehicles are rapidly evolving from machines controlled entirely by humans into intelligent systems capable of perceiving their surroundings, predicting traffic behavior, planning trajectories, and controlling the vehicle.

At the center of this evolution is **ADAS — Advanced Driver Assistance Systems**.

ADAS includes technologies ranging from simple warnings such as Lane Departure Warning to sophisticated systems capable of controlling steering, acceleration, braking, lane changes, and eventually the complete driving task.

However, not every vehicle marketed as having "Autopilot," "hands-free driving," or "self-driving" is actually autonomous.

To create a common language for describing vehicle automation, SAE International defines **six levels of driving automation: Level 0 through Level 5**. ([SAE International][1])

---

# 1. What Is ADAS?

**ADAS — Advanced Driver Assistance Systems** refers to electronic systems that assist drivers with driving, parking, collision avoidance, navigation, and vehicle control.

A modern ADAS architecture generally follows this pipeline:

```text
Environment
     ↓
Sensors
     ↓
Perception
     ↓
Localization
     ↓
Prediction
     ↓
Planning
     ↓
Vehicle Control
     ↓
Steering / Throttle / Brake
```

ADAS systems may use combinations of:

* Cameras
* Radar
* LiDAR
* Ultrasonic sensors
* GNSS/GPS
* IMU
* Wheel-speed sensors
* High-definition maps
* Driver-monitoring cameras

The difference between basic ADAS and autonomous driving is primarily **how much responsibility transfers from the human driver to the automated driving system**.

---

# 2. The SAE Levels of Driving Automation

SAE J3016 defines six automation levels:

| SAE Level | Name                           | Steering / Speed | Environment Monitoring | Fallback Responsibility |
| --------- | ------------------------------ | ---------------- | ---------------------- | ----------------------- |
| **0**     | No Driving Automation          | Human            | Human                  | Human                   |
| **1**     | Driver Assistance              | Human + System   | Human                  | Human                   |
| **2**     | Partial Driving Automation     | System           | Human                  | Human                   |
| **3**     | Conditional Driving Automation | System           | System                 | Human when requested    |
| **4**     | High Driving Automation        | System           | System                 | System within ODD       |
| **5**     | Full Driving Automation        | System           | System                 | System everywhere       |

The progression can be summarized as:

```text
L0
Human drives everything
        │
        ▼
L1
Vehicle assists one part
of vehicle control
        │
        ▼
L2
Vehicle controls steering
and speed simultaneously
        │
        ▼
L3
Vehicle also monitors
the driving environment
        │
        ▼
L4
Vehicle can handle failures
without human intervention
within its ODD
        │
        ▼
L5
Vehicle drives everywhere
a human driver could
```

The biggest conceptual boundary is between:

```text
Levels 0–2
Human is responsible for supervising driving

Levels 3–5
Automated Driving System performs
the driving-environment monitoring
```

---

# 3. Level 0 — No Driving Automation

Level 0 does not mean that the vehicle contains no intelligent technology.

It means that the **human performs the Dynamic Driving Task**.

The vehicle may:

* Warn the driver
* Detect danger
* Momentarily intervene

But it does not continuously perform the driving task.

Typical Level 0 technologies include:

### Forward Collision Warning

```text
Camera/Radar
     ↓
Vehicle detected
     ↓
Time-to-collision calculation
     ↓
Collision risk
     ↓
Warning
```

The driver still brakes.

---

### Lane Departure Warning

```text
Camera
   ↓
Lane detection
   ↓
Vehicle trajectory
   ↓
Lane crossing predicted
   ↓
Warning
```

Again, the system warns rather than continuously drives.

---

### Automatic Emergency Braking

AEB is slightly more sophisticated.

```text
Object detected
      ↓
Collision probability
      ↓
Driver fails to react
      ↓
Automatic braking
```

Because the intervention is temporary rather than continuous vehicle control, automatic emergency braking alone does not turn the vehicle into a higher-level automated vehicle.

---

# 4. Level 1 — Driver Assistance

Level 1 introduces **continuous assistance with part of the driving task**.

Common examples include:

### Adaptive Cruise Control

```text
Radar / Camera
      ↓
Lead vehicle detection
      ↓
Distance + relative velocity
      ↓
Target speed
      ↓
Throttle / Brake
```

The system controls longitudinal motion:

```text
Acceleration
+
Braking
```

while the driver controls steering.

---

Another Level 1 example is a continuous lane-centering system.

```text
Camera
   ↓
Lane detection
   ↓
Lane center calculation
   ↓
Steering controller
   ↓
Steering actuator
```

Here:

```text
System → steering
Driver → acceleration/braking
```

The critical characteristic is that the automation does not perform both lateral and longitudinal control simultaneously as one combined driving automation function.

---

# 5. Level 2 — Partial Driving Automation

Level 2 is where most sophisticated consumer ADAS systems currently operate.

The vehicle can simultaneously control:

```text
Lateral Control
Steering

+

Longitudinal Control
Acceleration
Braking
```

A simplified architecture looks like:

```text
        Cameras
        Radar
        GPS
          │
          ▼
      Perception
          │
          ▼
 ┌────────┼────────┐
 │        │        │
Lane   Vehicles  Free Space
 │        │        │
 └────────┼────────┘
          ▼
      Prediction
          │
          ▼
    Path Planning
          │
     ┌────┴────┐
     ▼         ▼
 Steering   Speed Control
     │         │
     └────┬────┘
          ▼
        Vehicle
```

The crucial limitation is:

> **The driver must continuously supervise the system.**

That remains true even when the vehicle allows the driver to remove their hands from the wheel.

Hands-free does **not** automatically mean autonomous.

---

# 6. Examples of Modern Level 2 Systems

## Tesla Full Self-Driving (Supervised)

Tesla's system demonstrates why product naming cannot be used to determine the SAE level.

Tesla currently calls its system:

**Full Self-Driving (Supervised)**.

Tesla explicitly states that the driver must remain attentive and that FSD (Supervised) does **not** make the vehicle fully autonomous. The cabin camera monitors driver attention while the system operates. ([Tesla][2])

FSD (Supervised) can perform sophisticated tasks such as:

```text
Road perception
      ↓
Lane / object understanding
      ↓
Trajectory planning
      ↓
Steering
Acceleration
Braking
Navigation behavior
```

But:

```text
FSD Supervised

System:
Driving control

Human:
Continuous supervision
+
Fallback
```

Therefore, despite considerable automation capability, the human remains responsible.

---

# 7. Ford BlueCruise

Ford BlueCruise provides another useful Level 2 example.

Ford describes BlueCruise as a **Level 2 driver-assistance system**. When activated on compatible roads it can control:

* Steering
* Acceleration
* Braking
* Lane positioning

while allowing hands-free operation.

However:

```text
Hands:
May be off wheel

Eyes:
Must remain on road
```

Ford uses a driver-facing camera to monitor driver attention.

Ford therefore describes the concept as essentially:

**hands-off, eyes-on driving**. ([From the Road][3])

BlueCruise has expanded across multiple Ford models and markets, with selected vehicles including models such as the Mustang Mach-E, Kuga, Puma, Puma Gen-E and Ranger depending on region. ([Ford Polska][4])

---

# 8. GM Super Cruise

General Motors' Super Cruise follows a similar philosophy.

Super Cruise combines:

* Cameras
* Vehicle sensors
* GPS
* Precision map information
* Driver monitoring

to provide hands-free driving on supported roads. ([General Motors][5])

The system can perform tasks including automatic lane changes on supported vehicles.

Its architecture can be approximated as:

```text
Camera + Radar/Sensors
         +
GPS + Precision Map
         ↓
Localization
         ↓
Lane / Traffic Understanding
         ↓
Trajectory Planning
         ↓
Steering + Speed Control
```

while:

```text
Driver-monitoring camera
          ↓
Head / eye attention
          ↓
Driver availability
```

GM said in October 2025 that Super Cruise was available across **23 models** from its nameplates and operated across more than 600,000 miles of mapped North American roads, with additional geographic expansion underway. ([GM News][6])

GM has separately announced plans for future **eyes-off driving**, targeted for 2028 beginning with the Cadillac Escalade IQ, illustrating the company's planned transition beyond today's supervised hands-free architecture. ([GM News][7])

---

# 9. Hyundai Highway Driving Assist 2

Hyundai's **Highway Driving Assist 2 — HDA 2** combines several functions.

It can assist with:

* Maintaining speed
* Maintaining following distance
* Lane centering
* Highway curves
* Assisted lane changes

Hyundai explicitly describes HDA 2 on models such as the IONIQ 6 as **Level 2 autonomous driving**, while still requiring driver participation. ([HYUNDAI MOTORS][8])

For example:

```text
Navigation + Cameras + Radar
             ↓
         Highway model
             ↓
     Vehicle ahead detected
             ↓
     Desired speed/distance
             ↓
       Lane positioning
             ↓
Steering + Acceleration + Braking
```

On Hyundai's 2026 Palisade, HDA 2 can maintain speed and distance and assist with lane changes under its operating conditions. ([HYUNDAI MOTORS][9])

---

# 10. Nissan ProPILOT 2.0

Nissan's **ProPILOT 2.0** introduces hands-off highway operation under supported conditions.

Nissan describes ProPILOT 2.0 as combining:

* Navigation
* 360-degree sensing
* Highway driving assistance
* HD 3D map information
* Lane control

The system allows hands-off driving while cruising in a lane under supported conditions, but the driver must continue watching the road and be ready to take control. ([Nissan][10])

This produces an architecture roughly like:

```text
HD Map
  +
GNSS
  +
360° Sensors
  ↓
Localization
  ↓
Road topology
  ↓
Traffic perception
  ↓
Route planning
  ↓
Lane / speed controller
```

Nissan states that ProPILOT 2.0 can also assist with overtaking, lane changes, highway branches and exits along predetermined routes. ([Nissan][11])

Again:

```text
Hands-off ≠ Eyes-off
```

---

# 11. Toyota Safety Sense

Toyota takes a more incremental approach through **Toyota Safety Sense**.

Depending on the model and TSS generation, features can include:

* Pre-Collision System
* Pedestrian Detection
* Dynamic Radar Cruise Control
* Lane Departure Alert
* Steering Assist
* Lane Tracing Assist
* Road Sign Assist
* Automatic High Beams

Toyota's Lane Tracing Assist uses detected lane markings and/or a preceding vehicle to help maintain lane centering while Dynamic Radar Cruise Control is operating. ([Toyota][12])

Conceptually:

```text
Radar → Lead vehicle

Camera → Lane markings

             ↓

Dynamic Radar Cruise Control
             +
Lane Tracing Assist

             ↓

Steering + Speed assistance
```

These systems remain **driver-assistance technologies**, with the driver responsible for the driving task.

---

# 12. Volvo Pilot Assist

Volvo's Pilot Assist combines:

```text
Adaptive speed management
+
Following-distance management
+
Steering assistance
```

Volvo describes Pilot Assist as assisting the vehicle between lane markings while maintaining speed and a selected time interval to vehicles ahead. ([Volvo Cars][13])

Volvo also explicitly states that the driver remains responsible for driving decisions and responses while using Pilot Assist. ([Volvo Cars][14])

Therefore:

```text
Pilot Assist
     ↓
Powerful driver assistance
     ↓
Not replacement for driver supervision
```

---

# 13. Level 3 — Conditional Driving Automation

Level 3 creates one of the most important transitions in automated driving.

Compare Level 2:

```text
SYSTEM:
Controls vehicle

HUMAN:
Monitors road
```

with Level 3:

```text
SYSTEM:
Controls vehicle
+
Monitors road

HUMAN:
Available for takeover
when requested
```

The driver does not have to continuously supervise the environment while the Level 3 Automated Driving System is legitimately operating within its approved conditions.

This means the system must perform the complete **Dynamic Driving Task** within its Operational Design Domain.

---

# 14. Operational Design Domain — ODD

Autonomous systems are generally not simply:

```text
ON
or
OFF
```

Instead, they operate within an **Operational Design Domain**.

ODD describes the conditions in which an automated driving system is designed to work.

For example:

```text
ODD

Road:
Motorway only

Speed:
≤ defined maximum

Weather:
Suitable conditions

Location:
Approved geographic region

Lane markings:
Available

Sensors:
Operational

Map:
Supported

Traffic:
Within supported conditions
```

If those conditions disappear:

```text
ODD valid
   ↓
Automation active

ODD becoming invalid
   ↓
System detects boundary
   ↓
Takeover request
```

---

# 15. Mercedes-Benz DRIVE PILOT — Level 3

One of the most important production examples is **Mercedes-Benz DRIVE PILOT**.

Mercedes explicitly classifies DRIVE PILOT as **SAE Level 3 conditionally automated driving**. ([Mercedes-Benz Group][15])

Under approved operating conditions:

```text
Mercedes DRIVE PILOT

Steering       → System
Acceleration   → System
Braking        → System
Road monitoring→ System
```

That produces the important difference:

```text
Level 2
Eyes must continuously monitor road

Level 3
Eyes-off can be permitted
within the approved operating domain
```

Mercedes announced an upgraded DRIVE PILOT in Germany capable of conditionally automated operation at speeds up to **95 km/h on German motorways**, subject to the system's operating conditions and regulatory approval. ([Mercedes-Benz Group][16])

Its system philosophy involves considerable redundancy because a Level 3 vehicle must take responsibility for much more than a Level 2 driver-assistance system.

A conceptual architecture is:

```text
Camera ──┐
Radar ───┤
LiDAR ───┤
GNSS ────┤
HD Map ──┤
Other vehicle sensors
         │
         ▼
   Environment Model
         ↓
   Localization
         ↓
   Prediction
         ↓
   Trajectory Planning
         ↓
   Motion Control
```

with redundant safety mechanisms monitoring critical components.

---

# 16. BMW Personal Pilot L3

BMW has also entered the Level 3 domain.

BMW's **Personal Pilot L3** enables conditionally automated operation under approved conditions.

In October 2025 BMW announced regulatory approval in Germany for a combination of advanced **Level 2 and Level 3 capabilities**, integrating Personal Pilot L3 with its broader driver-assistance ecosystem. ([BMW Group PressClub][17])

This illustrates an important future vehicle architecture:

```text
Normal road
    ↓
Driver / Level 2 assistance

Supported L3 conditions detected
    ↓
Level 3 activation

System handles Dynamic Driving Task
    ↓
ODD ending

Takeover request
    ↓
Driver resumes control
```

Rather than placing the entire vehicle permanently at one automation level, future vehicles can support **different automation levels in different operating conditions**.

---

# 17. Honda Traffic Jam Pilot

Honda is historically important because the company introduced one of the earliest production Level 3 systems.

The Honda Legend equipped with **Honda SENSING Elite Traffic Jam Pilot** received Level 3 approval in Japan.

Honda describes its architecture as using:

* High-definition 3D maps
* GNSS
* 360-degree external sensors
* Driver-monitoring camera
* Main ECU
* Steering control
* Throttle control
* Brake control

to perform perception, prediction and decision-making. ([Honda Japan][18])

The operating concept was:

```text
Highway congestion
      +
Approved conditions
      ↓
Traffic Jam Pilot
      ↓
System monitors environment
      ↓
System drives
      ↓
Conditions ending
      ↓
Driver takeover request
```

The specific Legend implementation is now an archived model, so it is better viewed as a major **historical milestone in production Level 3 deployment** rather than a broadly available current Honda product. ([Honda Japan][19])

---

# 18. Why Level 3 Is Much Harder Than Level 2

It may appear that Level 3 is simply a better Level 2 system.

Architecturally, the difference is much greater.

At Level 2:

```text
Sensor failure?
        ↓
Driver should recognize problem
        ↓
Driver intervenes
```

At Level 3:

```text
Sensor failure?
        ↓
System must detect failure
        ↓
System maintains safe operation
        ↓
Takeover procedure
```

Therefore L3 systems require far stronger:

* Sensor diagnostics
* Compute redundancy
* Actuator redundancy
* Vehicle localization
* Safety validation
* Fail-operational behavior
* Driver-state monitoring
* Takeover management
* Cybersecurity
* Safety engineering

---

# 19. Level 4 — High Driving Automation

Level 4 removes another major dependency:

**the human is no longer the required fallback within the system's ODD.**

Compare:

```text
LEVEL 3

Problem
  ↓
Ask driver
  ↓
Driver takes control
```

with:

```text
LEVEL 4

Problem
  ↓
Vehicle handles problem
  ↓
Continue safely
or
Minimal Risk Maneuver
```

For example:

```text
Sensor degraded
      ↓
Redundant sensors
      ↓
Reduced-speed operation
      ↓
Safe location identified
      ↓
Vehicle stops itself
```

The passenger does not need to become the driver.

---

# 20. Waymo — Level 4 Autonomous Driving

Waymo represents one of the clearest real-world Level 4 architectures.

Waymo describes the **Waymo Driver** as its self-driving technology, combining an integrated set of sensors and computing systems. ([Waymo][20])

Waymo's own research explicitly refers to the Waymo Driver as an **SAE Level 4 Automated Driving System**. ([Waymo][21])

A simplified architecture is:

```text
            Cameras
               +
              Radar
               +
              LiDAR
               +
      Localization systems
               ↓
        Sensor Fusion
               ↓
      World Representation
               ↓
   Object Classification
               ↓
         Prediction
               ↓
        Path Planning
               ↓
       Motion Planning
               ↓
     Vehicle Controller
        │      │      │
        ▼      ▼      ▼
    Steering Brake Throttle
```

The biggest difference from Tesla FSD Supervised, BlueCruise or Super Cruise is responsibility.

```text
Tesla FSD Supervised
Ford BlueCruise
GM Super Cruise
        ↓
Human driver supervises


Waymo Level 4 operation
        ↓
Waymo Driver supervises driving
        ↓
Human driver not required
within its ODD
```

That distinction is far more important than whether the steering wheel is physically being touched.

---

# 21. Level 5 — Full Driving Automation

Level 5 represents full automation.

Conceptually:

```text
No driver
No driver supervision
No driver fallback
No restricted ODD
```

The system would be expected to drive anywhere and under the road conditions in which a competent human driver could reasonably perform the task.

A hypothetical Level 5 vehicle could therefore be designed without:

```text
Steering wheel
Pedals
Driver monitoring
Driver seat
```

The interface could simply become:

```text
Passenger
    ↓
Select destination
    ↓
Autonomous vehicle
    ↓
Destination
```

As of **August 2026, there is no broadly deployed commercial Level 5 driving system**.

Real-world deployment is primarily concentrated around Level 2 systems, limited Level 3 implementations, and geographically constrained Level 4 autonomous services.

---

# 22. Current ADAS Landscape by Brand

A simplified snapshot of important industry implementations is:

| Company / Brand | System              |                    Approximate Automation Category |         Hands-Free        |               Eyes-Off               | Typical Domain                       |
| --------------- | ------------------- | -------------------------------------------------: | :-----------------------: | :----------------------------------: | ------------------------------------ |
| Toyota          | Toyota Safety Sense | L1/L2 assistance depending on function combination |         Usually No        |                  No                  | General/highway assistance           |
| Volvo           | Pilot Assist        |                                 L2-type assistance |        Generally No       |                  No                  | Highway/general roads                |
| Hyundai         | HDA 2               |                                             **L2** |  Limited/market dependent |                  No                  | Highway                              |
| Nissan          | ProPILOT 2.0        |                                             **L2** | Yes, supported conditions |                  No                  | Mapped highways                      |
| Tesla           | FSD (Supervised)    |                     **L2 supervised architecture** |      System-dependent     |                  No                  | Broad road network                   |
| Ford            | BlueCruise          |                                             **L2** |            Yes            |                  No                  | Approved Blue Zones                  |
| GM              | Super Cruise        |                       **L2 supervised hands-free** |            Yes            |                  No                  | Supported mapped roads               |
| Mercedes-Benz   | DRIVE PILOT         |                                             **L3** |            Yes            | **Yes under approved L3 conditions** | Approved motorway conditions         |
| BMW             | Personal Pilot L3   |                                             **L3** |            Yes            |   **Yes under approved conditions**  | Approved motorway/traffic conditions |
| Honda           | Traffic Jam Pilot   |             **L3 historical production milestone** |            Yes            |             Yes under ODD            | Highway traffic jams                 |
| Waymo           | Waymo Driver        |                                             **L4** |     No driver required    |                  Yes                 | Geofenced autonomous service         |
| Industry        | General Level 5     |                                             **L5** |            N/A            |                  N/A                 | Not commercially achieved            |

These classifications should always be interpreted together with the **specific model, software version, country, road type and regulatory approval**, because manufacturers can offer different functionality in different markets.

---

# 23. Hands-On, Hands-Off and Eyes-Off

A useful way to understand modern ADAS is to separate **hands** from **attention**.

### Hands-on

```text
Hands → Wheel
Eyes  → Road
```

Example:

basic lane-centering + adaptive cruise.

---

### Hands-off, eyes-on

```text
Hands → Off wheel allowed
Eyes  → Road required
```

Examples include supported operation of systems such as:

* Ford BlueCruise
* GM Super Cruise
* Nissan ProPILOT 2.0

Ford explicitly identifies BlueCruise as Level 2 where the driver must continue watching the road. ([From the Road][3])

---

### Hands-off, eyes-off

```text
Hands → Not required
Eyes  → Road monitoring not continuously required
```

This starts to appear at **Level 3**.

Example:

Mercedes-Benz DRIVE PILOT under its approved operating conditions. ([Mercedes-Benz Group][16])

---

### Driver-off

```text
Human fallback → Not required
```

This is Level 4 within an ODD.

Example:

Waymo Driver. ([Waymo][21])

---

# 24. Sensor Architectures Used by ADAS Manufacturers

Different manufacturers also make different engineering choices.

A generic multi-sensor autonomous architecture might use:

```text
Camera
   │
   ├── Color
   ├── Texture
   ├── Traffic lights
   ├── Signs
   └── Semantic information

Radar
   │
   ├── Distance
   └── Relative velocity

LiDAR
   │
   ├── Depth
   ├── Geometry
   └── 3D point cloud

GNSS + IMU
   │
   └── Vehicle localization

HD Map
   │
   └── Prior road information
```

These sources can be fused into:

```text
Camera ────┐
Radar ─────┤
LiDAR ─────┤
Map ───────┤
GPS/IMU ───┘
            ↓
       Sensor Fusion
            ↓
       World Model
```

---

# 25. Camera-Centric vs Multi-Sensor Approaches

Modern manufacturers have taken different approaches.

A camera-heavy architecture emphasizes:

```text
Images
   ↓
Neural networks
   ↓
Geometry / occupancy / objects
   ↓
Driving representation
```

Other systems use stronger sensor diversity:

```text
Camera
+
Radar
+
LiDAR
+
HD Maps
+
GNSS
        ↓
Multi-modal perception
```

Waymo explicitly describes an integrated sensor-and-compute architecture designed to perceive the environment across different ranges and conditions. ([Waymo][20])

GM's Super Cruise combines real-time cameras and vehicle sensors with GPS and precision map information. ([GM News][22])

Honda's Level 3 implementation similarly used high-definition maps, GNSS and multiple environmental sensors. ([Honda Japan][18])

There is therefore no single universal sensor architecture for ADAS.

---

# 26. The Software Architecture Behind Modern ADAS

Most modern ADAS stacks can conceptually be separated into six layers.

## Layer 1 — Sensors

```text
Camera
Radar
LiDAR
Ultrasonic
GNSS
IMU
Vehicle CAN
```

↓

## Layer 2 — Perception

Determines:

```text
What exists around the vehicle?
```

Examples:

* Cars
* Trucks
* Motorcycles
* Pedestrians
* Cyclists
* Lanes
* Traffic lights
* Signs
* Road boundaries
* Free space

↓

## Layer 3 — Localization

Determines:

```text
Where am I?
```

using combinations of:

```text
GNSS
+
IMU
+
Camera
+
LiDAR
+
Map
```

↓

## Layer 4 — Prediction

Determines:

```text
What will other road users do?
```

For example:

```text
Vehicle A
   ↓
Current velocity
   ↓
Lane geometry
   ↓
Turn signal
   ↓
History
   ↓
Predicted trajectory
```

↓

## Layer 5 — Planning

Determines:

```text
What should the ego vehicle do?
```

Examples:

```text
Follow lane
Change lane
Brake
Accelerate
Yield
Overtake
Stop
Turn
Merge
```

↓

## Layer 6 — Control

Transforms the desired trajectory into vehicle commands:

```text
Trajectory
    ↓
Controller
    ↓
Steering angle
Throttle
Brake pressure
```

---

# 27. Traditional ADAS vs End-to-End AI

Historically, autonomous-driving systems were highly modular:

```text
Camera
  ↓
Object detector
  ↓
Lane detector
  ↓
Tracking
  ↓
Prediction
  ↓
Planner
  ↓
Controller
```

Modern AI systems increasingly combine some of those stages.

For example:

```text
Multiple Camera Images
          ↓
      Neural Network
          ↓
Shared Scene Representation
          ↓
Occupancy / objects / lanes
          ↓
Trajectory
```

More aggressive end-to-end approaches attempt:

```text
Camera sequence
      ↓
Large neural network
      ↓
Driving trajectory
```

This architecture is closely related to the direction explored by systems such as Openpilot and research-oriented autonomous-driving networks.

---

# 28. Where Openpilot Fits

Openpilot is particularly useful for studying ADAS because it exposes much more of its architecture than proprietary vehicle systems.

Conceptually:

```text
Camera
   ↓
Driving Model
   ↓
Road / vehicle representation
   ↓
Desired trajectory
   ↓
Planning
   ↓
Lateral + Longitudinal controllers
   ↓
Vehicle interface
   ↓
CAN
   ↓
Steering / throttle / brake
```

Despite its advanced capabilities, Openpilot is fundamentally designed around **supervised driver assistance**, rather than the driverless Level 4 architecture represented by a robotaxi system such as Waymo.

That distinction has enormous implications for engineering.

---

# 29. What Changes From L2 to L4?

Consider a Level 2 stack:

```text
Camera
Radar
   ↓
Perception
   ↓
Planner
   ↓
Controller
   ↓
Vehicle
```

If something goes badly wrong:

```text
Human takes over.
```

For Level 4, that assumption disappears.

The architecture becomes closer to:

```text
             Sensors
       ┌──────┼──────┐
       ▼      ▼      ▼
    Camera  Radar  LiDAR
       │      │      │
       └──────┼──────┘
              ↓
         Sensor Fusion
              ↓
         World Model
              ↓
     Prediction + Planning
              ↓
       Vehicle Control
              │
       ┌──────┴──────┐
       ▼             ▼
Primary system   Safety system
       │             │
       └──────┬──────┘
              ↓
            Vehicle
```

plus:

```text
Health monitoring
Redundant compute
Redundant braking
Redundant steering
Sensor cleaning
Fallback planning
Minimal-risk maneuvers
Cybersecurity
Remote support
```

This is why moving from Level 2 to Level 4 is not simply a matter of training a more accurate neural network.

It requires an entirely different **system-safety architecture**.

---

# 30. The Most Important ADAS Progression

The evolution can ultimately be summarized as:

```text
LEVEL 0

"I warn you."
```

↓

```text
LEVEL 1

"I help you steer
OR
control speed."
```

↓

```text
LEVEL 2

"I steer AND control speed,
but you watch everything."
```

↓

```text
LEVEL 3

"I drive and watch,
but you must take over
when I ask."
```

↓

```text
LEVEL 4

"I drive, watch,
and handle failures myself
inside my operating domain."
```

↓

```text
LEVEL 5

"I am the driver."
```

---

# 31. Current State of the Industry

As of **August 2026**, the automotive industry is not progressing evenly from Level 0 through Level 5.

Instead, three major strategies have emerged.

### Strategy 1 — Improve Level 2

Companies continue making supervised assistance increasingly capable.

Examples include:

* Tesla FSD (Supervised)
* Ford BlueCruise
* GM Super Cruise
* Nissan ProPILOT
* Hyundai HDA
* Toyota Safety Sense
* Volvo Pilot Assist

These systems can provide enormous convenience while keeping the human responsible for supervision.

Tesla explicitly says FSD (Supervised) does not make the car fully autonomous. ([Tesla][23])

---

### Strategy 2 — Introduce Limited Level 3

Manufacturers such as Mercedes-Benz and BMW are transferring the driving task to the system under tightly controlled operating conditions.

```text
Limited roads
+
Limited speeds
+
Regulatory approval
+
Specific environment
=
L3 operation
```

Mercedes' DRIVE PILOT and BMW Personal Pilot L3 are major examples of this strategy. ([Mercedes-Benz Group][16])

---

### Strategy 3 — Skip Consumer L3 and Build L4 Services

Companies such as Waymo focus directly on autonomous fleets.

Instead of:

```text
Sell driver an autonomous car
```

the model becomes:

```text
Autonomous fleet
        ↓
Defined geographic ODD
        ↓
Robotaxi service
```

The geographic restriction makes the problem more manageable than trying to immediately build a Level 5 vehicle capable of operating everywhere.

---

# 32. Why Level 5 Remains Extremely Difficult

Level 5 must deal with essentially the full diversity of human driving environments:

```text
Snow
Rain
Fog
Flooding
Construction
Police gestures
Broken traffic lights
Unmarked roads
Temporary lanes
Animals
Emergency vehicles
Accidents
Unusual vehicles
Human negotiation
Poor maps
Sensor obstruction
Unexpected objects
```

This problem is sometimes described as the **long-tail problem**.

A system may successfully handle:

```text
99%
```

of driving situations while the remaining:

```text
1%
```

contains millions of unusual combinations.

For Level 2:

```text
Rare situation
    ↓
Human intervenes
```

For Level 5:

```text
Rare situation
    ↓
AI must solve it safely
```

That is an enormous difference.

---

# Conclusion

ADAS should not be viewed as one technology.

It is an entire spectrum of vehicle intelligence:

```text
Warning
   ↓
Assistance
   ↓
Partial Automation
   ↓
Conditional Automation
   ↓
High Automation
   ↓
Full Automation
```

The most important question when evaluating any ADAS system is therefore not:

> "Can the vehicle steer itself?"

or:

> "Can I remove my hands from the steering wheel?"

The important questions are:

```text
Who monitors the road?

Who decides what to do?

Who handles system failure?

Who is responsible when the system reaches its limit?
```

Those questions separate the SAE levels.

Today, sophisticated systems such as **Tesla FSD (Supervised), Ford BlueCruise, GM Super Cruise, Hyundai HDA 2 and Nissan ProPILOT 2.0** demonstrate how capable supervised Level 2-class systems have become. ([Tesla][23])

**Mercedes-Benz DRIVE PILOT and BMW Personal Pilot L3** demonstrate the industry's transition toward conditional Level 3 automation, where responsibility for monitoring the driving environment can temporarily move from the human to the automated driving system under approved operating conditions. ([Mercedes-Benz Group][16])

And **Waymo** demonstrates a fundamentally different Level 4 approach: remove the requirement for a human driver entirely, but constrain the autonomous system to an Operational Design Domain in which it has been designed and validated to operate. ([Waymo][21])

The evolution can therefore be reduced to one final diagram:

```text
             RESPONSIBILITY

L0      Human ████████████████████

L1      Human ██████████████████
        ADS   ██

L2      Human ████████████
        ADS   ████████

              ↓ Major boundary

L3      Human ████
        ADS   ████████████████

L4      Human
        ADS   ████████████████████
        within ODD

L5      Human
        ADS   ████████████████████
        unrestricted
```

ADAS is therefore not simply the story of cars becoming better at steering themselves.

It is the story of **driving responsibility gradually moving from human intelligence to machine intelligence**.

[1]: https://www.sae.org/standards/j3016-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles?utm_source=chatgpt.com "J3016 : Taxonomy and Definitions for Terms Related to ..."
[2]: https://www.tesla.com/ownersmanual/model3/en_us/GUID-2CB60804-9CEA-4F4B-8B04-09B991368DC5.html?utm_source=chatgpt.com "Full Self-Driving (Supervised)"
[3]: https://www.fromtheroad.ford.com/us/en/articles/2026/bluecruise--technology-designed-for-trust-driver-collaboration?utm_source=chatgpt.com "How BlueCruise Technology Collaborates with the Driver"
[4]: https://www.ford.pl/technologia/bluecruise?utm_source=chatgpt.com "Ford BlueCruise: Technologia jazdy bez użycia rąk"
[5]: https://www.gm.com/innovation/autonomous-driving?utm_source=chatgpt.com "Autonomous Driving: Self-Driving Technology"
[6]: https://news.gm.com/home.detail.html/Pages/topic/us/en/2025/oct/1009-GMs-path-full-autonomy-Building-trust-step-by-step.html?utm_source=chatgpt.com "GM's path to full autonomy: Building trust step-by-step"
[7]: https://news.gm.com/home.detail.html/Pages/news/us/en/2025/oct/1022-UM-GM-eyes-off-driving-conversational-AI-unified-software-platform.html?utm_source=chatgpt.com "GM announces eyes-off driving, conversational AI, and unified ..."
[8]: https://www.hyundai.com/eu/en/models/ioniq-6/features.html?utm_source=chatgpt.com "IONIQ 6 | Features"
[9]: https://www.hyundai.com/worldwide/en/suv/palisade-2026/safety?utm_source=chatgpt.com "The all-new PALISADE Safety | SUV"
[10]: https://www.nissan-global.com/EN/INNOVATION/TECHNOLOGY/ARCHIVE/PROPILOT2/?utm_source=chatgpt.com "ProPILOT 2.0 | Innovation"
[11]: https://www.nissan-global.com/EN/INNOVATION/TECHNOLOGY/VEHICLE_INTELLIGENCE/PROPILOT/?utm_source=chatgpt.com "Advanced driver-assistance features ProPILOT | Innovation"
[12]: https://www.toyota.com/safety-sense/?utm_source=chatgpt.com "Toyota Safety Hub – Vehicle Safety Features | Toyota Owners"
[13]: https://www.volvocars.com/in/support/car/xc40/article/12117c7683989fdfc0a801517328f0a0/?utm_source=chatgpt.com "XC40 Pilot Assist | Volvo Support IN"
[14]: https://www.volvocars.com/in/support/car/xc90/article/47d2c97fd33effd3c0a8cc3718c999b7-85596e53922f2e19c0a8cc42679c08ea-8664b2fa77a7e089c0a8296870d1a409_47d2c97fd33effd3c0a8cc3718c999b7-835992c35a0096eec0a8b0971dfcc685-8664b2fa77a7e089c0a8296870d1a409_47d2c97fd33effd3c0a8cc3718c999b7-69b1d5f35a03429ac0a8b0970ac5ed2e-8664b2fa77a7e089c0a8296870d1a409_54f1934e3fd57300c0a8b0c1194a56be-69b1d5f35a03429ac0a8b0970ac5ed2e-8664b2fa77a7e089c0a8296870d1a409/?utm_source=chatgpt.com "XC90 Pilot Assist conditions and limitations"
[15]: https://group.mercedes-benz.com/technology/autonomous-driving/?utm_source=chatgpt.com "Autonomous Driving"
[16]: https://group.mercedes-benz.com/technology/autonomous-driving/driving/drive-pilot-95-kmh.html?utm_source=chatgpt.com "Support speed of up to 95 km/h on German motorways."
[17]: https://www.press.bmwgroup.com/global/article/detail/T0453593EN/smart-safe-symbiotic%3A-bmw-group-is-the-first-car-manufacturer-in-germany-to-receive-international-approval-for-innovative-assistance-systems-in-accordance-with-the-new-dcas-regulation?language=en&utm_source=chatgpt.com "Smart, safe, symbiotic: BMW Group is the first car ..."
[18]: https://www.honda.co.jp/news/2021/4210304-legend.html?utm_source=chatgpt.com "Honda SENSING Elite 搭載 新型「LEGEND」を発売"
[19]: https://www.honda.co.jp/auto-archive/legend/4door/2022/hondasensing-elite/?utm_source=chatgpt.com "Honda SENSING Elite 特設サイト（2022年1月終了モデル）"
[20]: https://waymo.com/waymo-driver/?utm_source=chatgpt.com "Self-Driving Car Technology for a Reliable Ride"
[21]: https://waymo.com/research/challenges-for-the-evaluation-of-automated-driving/?utm_source=chatgpt.com "Challenges for the evaluation of automated driving systems ..."
[22]: https://news.gm.com/home.detail.html/Pages/topic/us/en/2025/feb/0228-supercruise.html?utm_source=chatgpt.com "Super Cruise 101: All you need to know about GM's hands ..."
[23]: https://www.tesla.com/support/fsd?utm_source=chatgpt.com "Full Self-Driving (Supervised) | Tesla Support"
