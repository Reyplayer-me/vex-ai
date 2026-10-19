import StaticPage from "./StaticPage";
import FeedbackForm from "@/components/FeedbackForm";

const Contact = () => (
  <StaticPage title="Contact">
    <p>Questions, bug reports, data deletion requests: send them here, or email rshalm20@gmail.com.</p>
    <div className="pt-4">
      <FeedbackForm kind="contact" showName submitLabel="Send message" />
    </div>
  </StaticPage>
);

export default Contact;
