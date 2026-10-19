import { Link } from "react-router-dom";
import StaticPage from "./StaticPage";

const About = () => (
  <StaticPage title="About Vex">
    <p>Vex is a decision tool for people with startup ideas. It isn't a general chatbot. You describe one idea, and a panel of five AI advisors scores it, challenges it and tells you whether to proceed, pivot or drop it.</p>
    <p>If the idea holds up, Vex turns it into a three-phase roadmap, a tech stack with a first-weekend build plan, and a launch plan for your first 20 users. Everything is saved to your dashboard.</p>
    <p>Vex is in early access and free while we're growing. It's built by a small team, and we read every piece of feedback.</p>
    <p>Questions? <Link to="/contact" className="text-foreground underline">Get in touch</Link>.</p>
  </StaticPage>
);

export default About;
