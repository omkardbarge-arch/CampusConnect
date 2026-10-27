import { useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function useFormSubmit(endpoint) {
  const [state, setState] = useState({ type: '', message: '', loading: false });

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const payload = Object.fromEntries(new FormData(form).entries());
    setState({ type: '', message: '', loading: true });
    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = data.errors ? Object.values(data.errors).join(' ') : '';
        throw new Error([data.message, details].filter(Boolean).join(' ' ) || 'Submission failed. Please try again.');
      }
      form.reset();
      setState({ type: 'success', message: data.message || 'Submission received.', loading: false });
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Could not reach the server. Check your connection and try again.'
        : error.message;
      setState({ type: 'error', message, loading: false });
    }
  }

  return { state, handleSubmit };
}

function StatusMessage({ state }) {
  if (!state.message) return null;
  return (
    <div className={`alert ${state.type === 'success' ? 'alert-success' : 'alert-danger'} form-alert`} role="status" aria-live="polite">
      {state.message}
    </div>
  );
}

function Field({ label, id, children, hint }) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
      {hint && <div className="form-text">{hint}</div>}
    </div>
  );
}

function TextInput({ id, name = id, label, type = 'text', placeholder, autoComplete, pattern, title, minLength, maxLength, required = true, inputMode }) {
  return (
    <Field label={label} id={id}>
      <input
        className="form-control"
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        pattern={pattern}
        title={title}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        inputMode={inputMode}
      />
    </Field>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function StudentForm() {
  const { state, handleSubmit } = useFormSubmit('students');
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <TextInput id="student-fullName" name="fullName" label="Full name" placeholder="e.g. Aditi Sharma" autoComplete="name" minLength={2} maxLength={80} />
        <TextInput id="student-email" name="email" label="College email" type="email" placeholder="you@college.edu" autoComplete="email" maxLength={254} />
        <TextInput id="student-rollNumber" name="rollNumber" label="Roll number" placeholder="e.g. C066" minLength={3} maxLength={20} pattern="[A-Za-z0-9/-]{3,20}" title="Use 3–20 letters, numbers, slash or hyphen." />
        <Field label="Department" id="department">
          <select className="form-select" id="department" name="department" required defaultValue="">
            <option value="" disabled>Select department</option>
            <option>Computer Engineering</option>
            <option>Information Technology</option>
            <option>Electronics and Telecommunication</option>
            <option>Mechanical Engineering</option>
            <option>Civil Engineering</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Academic year" id="year">
          <select className="form-select" id="year" name="year" required defaultValue="">
            <option value="" disabled>Select year</option>
            <option value="1">First year</option>
            <option value="2">Second year</option>
            <option value="3">Third year</option>
            <option value="4">Fourth year</option>
          </select>
        </Field>
        <TextInput id="phone" label="Mobile number" type="tel" placeholder="10-digit mobile number" autoComplete="tel-national" inputMode="numeric" minLength={10} maxLength={10} pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number." />
      </div>
      <p className="privacy-note"><span aria-hidden="true">⌑</span> Your details are used only for this student portal demo.</p>
      <StatusMessage state={state} />
      <button className="btn btn-primary btn-submit" type="submit" disabled={state.loading}>
        {state.loading ? 'Submitting…' : 'Register student'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

function EventForm() {
  const { state, handleSubmit } = useFormSubmit('events');
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <TextInput id="event-fullName" name="fullName" label="Full name" placeholder="Name on your college ID" autoComplete="name" minLength={2} maxLength={80} />
        <TextInput id="event-email" name="email" label="Email address" type="email" placeholder="you@college.edu" autoComplete="email" maxLength={254} />
        <TextInput id="event-rollNumber" name="rollNumber" label="Roll number" placeholder="e.g. C066" minLength={3} maxLength={20} pattern="[A-Za-z0-9/-]{3,20}" title="Use 3–20 letters, numbers, slash or hyphen." />
        <Field label="Choose an event" id="eventName">
          <select className="form-select" id="eventName" name="eventName" defaultValue="" required>
            <option value="" disabled>Select an event</option>
            <option>Tech Talk</option>
            <option>Web Development Workshop</option>
            <option>Campus Hackathon</option>
            <option>Cultural Fest</option>
          </select>
        </Field>
        <Field label="I want to join as a" id="participationType">
          <select className="form-select" id="participationType" name="participationType" defaultValue="Participant" required>
            <option>Participant</option>
            <option>Volunteer</option>
          </select>
        </Field>
      </div>
      <StatusMessage state={state} />
      <button className="btn btn-primary btn-submit" type="submit" disabled={state.loading}>
        {state.loading ? 'Submitting…' : 'Reserve my spot'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

function FeedbackForm() {
  const { state, handleSubmit } = useFormSubmit('feedback');
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <TextInput id="feedback-fullName" name="fullName" label="Your name" placeholder="Enter your name" autoComplete="name" minLength={2} maxLength={80} />
        <TextInput id="feedback-email" name="email" label="Email address" type="email" placeholder="you@college.edu" autoComplete="email" maxLength={254} />
        <Field label="Feedback category" id="category">
          <select className="form-select" id="category" name="category" defaultValue="" required>
            <option value="" disabled>Choose a category</option>
            <option>Academics</option>
            <option>Campus Facilities</option>
            <option>Events</option>
            <option>Technology</option>
            <option>Other</option>
          </select>
        </Field>
      </div>
      <fieldset className="rating-field mb-3">
        <legend className="form-label">How was your experience?</legend>
        <div className="rating-options">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label className="rating-option" key={rating}>
              <input type="radio" name="rating" value={rating} required />
              <span>{rating}</span>
            </label>
          ))}
        </div>
        <div className="form-text">1 = needs improvement · 5 = excellent</div>
      </fieldset>
      <Field label="Tell us more" id="message" hint="Please write between 10 and 1,000 characters.">
        <textarea className="form-control" id="message" name="message" rows="4" minLength="10" maxLength="1000" placeholder="What worked well? What can we improve?" required />
      </Field>
      <StatusMessage state={state} />
      <button className="btn btn-primary btn-submit" type="submit" disabled={state.loading}>
        {state.loading ? 'Sending…' : 'Send feedback'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="container site-nav" aria-label="Main navigation">
          <a className="brand" href="#home" onClick={closeMenu} aria-label="CampusConnect home">
            <span className="brand-mark">C<span>+</span></span>
            <span>Campus<span className="brand-light">Connect</span></span>
          </a>
          <button className="menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-controls="primary-navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span> <span aria-hidden="true">{mobileMenuOpen ? '×' : '☰'}</span>
          </button>
          <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`} id="primary-navigation">
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#features" onClick={closeMenu}>What you can do</a>
            <a href="#forms" onClick={closeMenu}>Forms</a>
            <a className="nav-cta" href="#student-registration" onClick={closeMenu}>Get started <span aria-hidden="true">↗</span></a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="hero-tag"><span className="live-dot" /> YOUR CAMPUS, CONNECTED</div>
              <h1>Make campus life<br />work <span>for you.</span></h1>
              <p className="hero-description">One simple place to join the student community, discover campus events, and make your voice heard.</p>
              <div className="hero-actions">
                <a className="btn btn-light btn-lg hero-primary" href="#student-registration">Join the community <span aria-hidden="true">↗</span></a>
                <a className="hero-text-link" href="#features">Explore features <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true"><span>AS</span><span>RK</span><span>MP</span><span>+ </span></div>
                <div><strong>Built for student life</strong><small>Registration · Events · Feedback</small></div>
              </div>
            </div>
            <div className="hero-visual" aria-label="CampusConnect feature preview">
              <div className="visual-topline"><span className="visual-status"><span /> CAMPUS DASHBOARD</span><span className="visual-dots">•••</span></div>
              <div className="visual-greeting"><div><small>YOUR CAMPUS HUB</small><h2>Hey, student<span>✳</span></h2><p>What would you like to do today?</p></div><div className="greeting-icon">✦</div></div>
              <div className="visual-mini-grid">
                <a href="#student-registration" className="mini-tile mini-tile-dark"><span className="tile-icon">↗</span><span>Student<br />registration</span><small>01 / JOIN IN</small></a>
                <a href="#event-registration" className="mini-tile mini-tile-mint"><span className="tile-icon">✳</span><span>Campus<br />events</span><small>02 / SHOW UP</small></a>
                <a href="#feedback" className="mini-tile mini-tile-peach"><span className="tile-icon">✎</span><span>Share your<br />feedback</span><small>03 / SPEAK UP</small></a>
              </div>
              <div className="visual-footer"><span className="footer-spark">✦</span><span>Your campus journey starts here.</span><span className="footer-arrow">↗</span></div>
              <div className="floating-sticker">GOOD<br />THINGS<br /><span>HAPPEN</span><b>✳</b></div>
            </div>
          </div>
          <div className="hero-bottom container"><span>DESIGNED AROUND YOU</span><span className="bottom-line" /><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="features-section section-pad" id="features">
          <div className="container">
            <SectionHeading eyebrow="A BETTER CAMPUS EXPERIENCE" title={<>Everything you need.<br /><em>All in one place.</em></>} description="Less running around. More getting involved. CampusConnect makes the everyday student essentials simple." />
            <div className="feature-grid">
              <article className="feature-card feature-card-lavender"><div className="feature-icon">◎</div><span className="feature-number">01 / PROFILE</span><h3>Make it official.</h3><p>Register your details and keep your student information organised in one place.</p><a href="#student-registration" aria-label="Go to student registration">Register as a student <span>↗</span></a><div className="feature-decoration decoration-ring" /></article>
              <article className="feature-card feature-card-yellow"><div className="feature-icon">✳</div><span className="feature-number">02 / PARTICIPATE</span><h3>Find your people.</h3><p>Sign up for tech talks, workshops, hackathons, and campus celebrations.</p><a href="#event-registration" aria-label="Go to event registration">Explore event signup <span>↗</span></a><div className="feature-decoration decoration-star">✳</div></article>
              <article className="feature-card feature-card-mint"><div className="feature-icon">↗</div><span className="feature-number">03 / IMPROVE</span><h3>Your voice matters.</h3><p>Share thoughtful feedback so your campus community can keep improving.</p><a href="#feedback" aria-label="Go to feedback form">Share your thoughts <span>↗</span></a><div className="feature-decoration decoration-smile">☺</div></article>
            </div>
          </div>
        </section>

        <section className="forms-section section-pad" id="forms">
          <div className="container">
            <SectionHeading eyebrow="YOUR NEXT STEP" title={<>A few details.<br /><em>A lot more possibilities.</em></>} description="Choose a form, fill in the required details, and submit. Required fields and input formats are validated in your browser and on the server." />
            <div className="forms-layout">
              <aside className="forms-aside">
                <div className="aside-label"><span className="live-dot" /> QUICK LINKS</div>
                <a href="#student-registration" className="form-jump"><span className="jump-index">01</span><span><strong>Student registration</strong><small>Create your student record</small></span><span className="jump-arrow">↗</span></a>
                <a href="#event-registration" className="form-jump"><span className="jump-index">02</span><span><strong>Event registration</strong><small>Save a place at an event</small></span><span className="jump-arrow">↗</span></a>
                <a href="#feedback" className="form-jump"><span className="jump-index">03</span><span><strong>Feedback</strong><small>Help us make things better</small></span><span className="jump-arrow">↗</span></a>
                <div className="aside-note"><div className="note-icon">✦</div><strong>Good to know</strong><p>Every submission is stored in the connected MongoDB database after server-side validation.</p></div>
              </aside>

              <div className="form-panels">
                <section className="form-card" id="student-registration" aria-labelledby="student-title">
                  <div className="form-card-header"><div className="form-icon form-icon-purple">01</div><div><span className="form-kicker">GET CONNECTED</span><h3 id="student-title">Student registration</h3><p>Tell us a little about yourself.</p></div><span className="required-note">* REQUIRED</span></div>
                  <StudentForm />
                </section>
                <section className="form-card" id="event-registration" aria-labelledby="event-title">
                  <div className="form-card-header"><div className="form-icon form-icon-yellow">02</div><div><span className="form-kicker">GET INVOLVED</span><h3 id="event-title">Event registration</h3><p>There’s always something happening.</p></div><span className="required-note">* REQUIRED</span></div>
                  <EventForm />
                </section>
                <section className="form-card" id="feedback" aria-labelledby="feedback-title">
                  <div className="form-card-header"><div className="form-icon form-icon-mint">03</div><div><span className="form-kicker">MAKE AN IMPACT</span><h3 id="feedback-title">Feedback &amp; suggestions</h3><p>Help us make the student experience better.</p></div><span className="required-note">* REQUIRED</span></div>
                  <FeedbackForm />
                </section>
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="container closing-inner"><div><span className="eyebrow">THIS IS YOUR CAMPUS, TOO</span><h2>Be part of<br /><em>what comes next.</em></h2></div><a href="#student-registration" className="closing-button">Start with registration <span>↗</span></a><div className="closing-star" aria-hidden="true">✳</div></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-mark">C<span>+</span></span><span>Campus<span className="brand-light">Connect</span></span></a><p>A student portal mini-project built with the MERN stack.</p><a className="back-top" href="#home">BACK TO TOP ↑</a></div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} CampusConnect</span><span>MADE FOR STUDENT LIFE <b>✳</b></span></div>
      </footer>
    </div>
  );
}

export default App;
