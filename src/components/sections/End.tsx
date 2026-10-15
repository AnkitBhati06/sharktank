import { imageProps } from "@/lib/image";
import ecellLogo from "@/assets/ecell-logo.png";
import { config, ending, event } from "@/content/event";

const logoImg = imageProps({ src: ecellLogo, alt: event.organiser, height: 150, sizes: "190px" });

export function End() {
  return (
    <>
      <section className="end" id="end" aria-labelledby="end-title">
        <div className="wrap">
          <p className="label">{ending.label}</p>
          <h2 id="end-title" data-reveal>
            Sink<em>or</em>Swim.
          </h2>
          <div className="go2">
            <a className="btn btn-ink" href="#register">
              Register your team <span className="ar" aria-hidden="true">→</span>
            </a>
            <a className="btn btn-line" href="#logs">
              Read the dive logs
            </a>
          </div>
        </div>
      </section>
      <footer>
        <div className="wrap org-credit">
          <p className="label">Organised by</p>
          <img {...logoImg} alt={event.organiser} />
        </div>
        <div className="wrap foot label">
          <span>
            {event.name} {event.year} · {event.organiser}
          </span>
          <a href={config.instagram} target="_blank" rel="noopener noreferrer">
            Instagram {event.instagramHandle} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </footer>
    </>
  );
}
