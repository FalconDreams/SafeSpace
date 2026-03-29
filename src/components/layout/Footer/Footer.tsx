export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bamboo-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Emergency Contacts</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="tel:911" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  911 — Emergency
                </a>
              </li>
              <li>
                <a href="tel:3034413460" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Boulder County Health — (303) 441-3460
                </a>
              </li>
              <li>
                <a href="tel:3034427060" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  EPRAS Mediation — (303) 442-7060
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="https://bouldercolorado.gov/services/renter-resources" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Boulder Tenant Rights
                </a>
              </li>
              <li>
                <a href="https://www.cobar.org/For-the-Public/Find-a-Lawyer" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Legal Aid Foundation
                </a>
              </li>
              <li>
                <a href="https://leg.colorado.gov/bills/hb24-1098" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  2024 Health Laws
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">About SafeSpace</h3>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Empowering Boulder County renters with health and safety guidance and transparent landlord accountability.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-bamboo-200 pt-8">
          <p className="text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} SafeSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
