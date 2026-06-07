import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">ℹ️ About Digital Chemistry Lab</h1>
        <p className="text-muted-foreground">Learn about this platform and how to use it</p>
      </div>

      {/* About */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What is Digital Chemistry Lab?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Digital Chemistry Lab is a modern, interactive platform designed to make chemistry learning engaging and
          accessible. It combines a rule-based reaction prediction engine with comprehensive study tools, allowing
          students to explore chemical reactions, understand compound properties, and collaborate with peers in study
          groups.
        </p>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span>⚗️</span>
            <span>
              <strong>Reaction Lab:</strong> Predict chemical reactions and explore multiple possible outcomes
            </span>
          </li>
          <li className="flex gap-2">
            <span>🔬</span>
            <span>
              <strong>Compound Explorer:</strong> Search and browse detailed information about chemical compounds
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Periodic Table:</strong> Interactive periodic table with element properties and trends
            </span>
          </li>
          <li className="flex gap-2">
            <span>📚</span>
            <span>
              <strong>Study Zone:</strong> Access glossary, study topics, and quizzes for self-paced learning
            </span>
          </li>
          <li className="flex gap-2">
            <span>👥</span>
            <span>
              <strong>Study Groups:</strong> Create or join study groups and collaborate with classmates
            </span>
          </li>
          <li className="flex gap-2">
            <span>📱</span>
            <span>
              <strong>Device History:</strong> Track your learning activity and export/import history
            </span>
          </li>
        </ul>
      </Card>

      {/* How to Use */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">1. Explore the Reaction Lab</p>
            <p className="text-muted-foreground">
              Enter two reactants (e.g., "Na" and "Cl") to predict possible reactions and see stability scores.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Search Compounds</p>
            <p className="text-muted-foreground">
              Use the Compound Explorer to find detailed information about chemical compounds.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Study Chemistry</p>
            <p className="text-muted-foreground">
              Access the Study Zone to learn concepts, review glossary terms, and take quizzes.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">4. Collaborate</p>
            <p className="text-muted-foreground">
              Create a study group and invite friends using the invite link feature.
            </p>
          </div>
        </div>
      </Card>

      {/* Technical Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Platform:</strong> Web-based, fully responsive and works on desktop, tablet, and mobile
          </p>
          <p>
            <strong>Data Storage:</strong> All data is stored locally in your browser using localStorage
          </p>
          <p>
            <strong>Privacy:</strong> Your data never leaves your device unless you explicitly export it
          </p>
          <p>
            <strong>Compatibility:</strong> Works on all modern browsers (Chrome, Firefox, Safari, Edge)
          </p>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Support & Feedback</h2>
        <p className="text-sm text-muted-foreground mb-4">
          We're constantly improving Digital Chemistry Lab. If you have suggestions, feedback, or encounter any issues,
          please let us know.
        </p>
        <div className="flex gap-2">
          <Button variant="outline">Report Issue</Button>
          <Button variant="outline">Send Feedback</Button>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Digital Chemistry Lab v1.0.0</p>
        <p>© 2026 All rights reserved</p>
      </div>
    </div>
  );
}
