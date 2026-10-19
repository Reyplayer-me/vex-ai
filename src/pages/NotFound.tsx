import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StaticPage from "./StaticPage";

const NotFound = () => (
  <StaticPage title="This page doesn't exist">
    <p>The link may be old, or the address has a typo. Nothing's broken on your end.</p>
    <div className="flex flex-wrap gap-3 pt-4">
      <Link to="/"><Button className="h-11 bg-purple text-accent-foreground hover:bg-purple/90">Back to home</Button></Link>
      <Link to="/dashboard"><Button variant="outline" className="h-11">Go to dashboard</Button></Link>
    </div>
  </StaticPage>
);

export default NotFound;
