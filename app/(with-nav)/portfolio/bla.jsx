export const metadata = {
  title: "Portfolio | Thuan An Doan",
};

export default function PortfolioPage() {
  return (
    <main className="portfolio-page">

      {/* HEADER */}
      <header className="portfolio-header">
        <h1>Thuan An Doan</h1>
        <h2>Fullstack Fresher</h2>

        <div className="portfolio-contact">
          <p>Email: anddoanf.work@gmail.com</p>
          <p>Phone: 0344093316</p>
          <p>Address: Hanoi, Vietnam</p>
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/AnDDoanf"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/AnDDoanf
            </a>
          </p>
        </div>
      </header>

      {/* SUMMARY */}
      <section className="portfolio-section">
        <h3>SUMMARY</h3>
        <p>
          I am a final-year Informatics student at the University of Science and
          Technology of Hanoi, with strong analytical and creative skills and a
          solid foundation in AI agents, large language models (LLMs), and
          software engineering. Guided by Christian values of integrity and
          responsibility, I aspire to build my career as a Software Engineer.
        </p>
      </section>

      {/* EXPERIENCE */}
      <section className="portfolio-section">
        <h3>EXPERIENCE</h3>

        <Experience
          location="Hanoi"
          date="Jul 2021 – Sep 2021"
          title="Front-End Internship"
          company="Zland"
          items={[
            "Interned in developing the front end for a real estate website using CSS and ReactJS.",
            "Developed responsive static websites with required features from clients.",
          ]}
        />

        <Experience
          location="Hanoi"
          date="Mar 2023 – Sep 2023"
          title="Intern AI Engineer"
          company="Aimelab – Aimesoft"
          items={[
            "Interned for 6 months in natural language processing for personal projects.",
            "Optimized and tested LLM models such as GPT-2, Pegasus, CLIP, and LLaMA.",
            "Built an interactive LLM chat web application using VectorDB, ReactJS, and NodeJS.",
          ]}
        />

        <Experience
          location="Hanoi"
          date="Jun 2024 – Mar 2025"
          title="Fresher Fullstack"
          company="SpringAI"
          items={[
            "Worked as a collaborator on an internal e-commerce application.",
            "Took part in building a chat system with an agentic workflow.",
          ]}
        />
      </section>

      {/* EDUCATION */}
      <section className="portfolio-section">
        <h3>EDUCATION</h3>
        <p><strong>Bachelor</strong> – University of Science and Technology of Hanoi</p>
        <p>Hanoi – Present</p>
      </section>

      {/* SKILLS */}
      {/* SKILLS */}
    <section className="portfolio-section">
        <h3>SKILLS</h3>

        <ul className="portfolio-skills">
            <li>
            <i className="bi bi-code-slash" />
            ReactJS, Next.js, Bootstrap
            </li>

            <li>
            <i className="bi bi-server" />
            Node.js, Express.js, RESTful APIs
            </li>

            <li>
            <i className="bi bi-database" />
            MongoDB, SQL, Vector Databases
            </li>

            <li>
            <i className="bi bi-cpu" />
            AI Agents, LLMs, Prompt Engineering
            </li>
        </ul>
    </section>


      {/* LANGUAGES */}
      <section className="portfolio-section">
        <h3>LANGUAGES</h3>
        <p>English – Advanced</p>
        <p>Vietnamese – Native</p>
      </section>

      {/* CERTIFICATIONS */}
      <section className="portfolio-section">
        <h3>CERTIFICATIONS & COURSES</h3>
        <p>Completed: Machine Learning Course by VietAI</p>
        <p>On Going: IBM Full Stack Software Developer</p>
      </section>

    </main>
  );
}

/* ===== Sub Component ===== */

function Experience({ location, date, title, company, items }) {
  return (
    <div className="portfolio-exp">
      <div className="portfolio-exp-left">
        <p>{location}</p>
        <p className="portfolio-date">{date}</p>
      </div>

      <div className="portfolio-exp-right">
        <h4>{title}</h4>
        <p className="portfolio-company">{company}</p>
        <ul>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
