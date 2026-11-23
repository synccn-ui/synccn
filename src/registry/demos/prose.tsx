import { Prose } from "@/registry/ui/prose";

export default function ProseDemo() {
  return (
    <Prose>
      <h1>Designing calm interfaces</h1>
      <p className="lead">Calm software does its job and gets out of the way.</p>
      <p>
        Start with <strong>defaults that work</strong>. Most people never change a setting, so the default is the design. When something needs attention, say what happened and what to do, like <code>Retry upload</code> instead of <code>Error 500</code>.
      </p>
      <h2>Three rules</h2>
      <ol>
        <li>Show one primary action per screen.</li>
        <li>Name things the way people already talk about them.</li>
        <li>Use motion only to explain change.</li>
      </ol>
      <blockquote>The best interface is the one nobody has to think about.</blockquote>
      <p>
        Read more in the <a href="#">design principles</a>.
      </p>
    </Prose>
  );
}
