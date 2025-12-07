import React, { useEffect } from "react";

export default function OffcanvasNavbar() {
  useEffect(() => {
    // Ajout du JS offcanvas
    const script = document.createElement("script");
    script.innerHTML = `
      (() => {
        'use strict'
        document.querySelector('#navbarSideCollapse')?.addEventListener('click', () => {
          document.querySelector('.offcanvas-collapse').classList.toggle('open')
        })
      })()
    `;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <style>{`
        html, body {
          overflow-x: hidden;
        }
        body {
          padding-top: 56px;
        }
        @media (max-width: 991.98px) {
          .offcanvas-collapse {
            position: fixed;
            top: 56px;
            bottom: 0;
            left: 100%;
            width: 100%;
            padding-right: 1rem;
            padding-left: 1rem;
            overflow-y: auto;
            visibility: hidden;
            background-color: #343a40;
            transition: transform .3s ease-in-out, visibility .3s ease-in-out;
          }
          .offcanvas-collapse.open {
            visibility: visible;
            transform: translateX(-100%);
          }
        }
        .nav-scroller .nav {
          color: rgba(255, 255, 255, .75);
        }
        .nav-scroller .nav-link {
          padding-top: .75rem;
          padding-bottom: .75rem;
          font-size: .875rem;
          color: #6c757d;
        }
        .nav-scroller .nav-link:hover {
          color: #007bff;
        }
        .nav-scroller .active {
          font-weight: 500;
          color: #343a40;
        }
        .bg-purple {
          background-color: #6f42c1;
        }
      `}</style>

      <nav className="navbar navbar-expand-lg fixed-top navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Offcanvas Navbar</a>
          <button
            className="navbar-toggler p-0 border-0"
            type="button"
            id="navbarSideCollapse"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Dashboard</a>
              </li>
              <li className="nav-item"><a className="nav-link" href="#">Notifications</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Profile</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Switch account</a></li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Settings
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">Action</a></li>
                  <li><a className="dropdown-item" href="#">Another action</a></li>
                  <li><a className="dropdown-item" href="#">Something else</a></li>
                </ul>
              </li>
            </ul>

            <form className="d-flex" role="search">
              <input className="form-control me-2" type="search" placeholder="Search" />
              <button className="btn btn-outline-success" type="submit">Search</button>
            </form>
          </div>
        </div>
      </nav>

      {/* NAV-SCROLLER */}
      <div className="nav-scroller bg-body shadow-sm fixed-top" style={{ top: '56px' }}>
        <nav className="nav" aria-label="Secondary navigation">
          <a className="nav-link active" aria-current="page" href="#">Dashboard</a>
          <a className="nav-link" href="#">
            Friends <span className="badge text-bg-light rounded-pill align-text-bottom">27</span>
          </a>
          <a className="nav-link" href="#">Explore</a>
          <a className="nav-link" href="#">Suggestions</a>
          <a className="nav-link" href="#">Link</a>
          <a className="nav-link" href="#">Link</a>
          <a className="nav-link" href="#">Link</a>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <main className="container">
        <div className="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm">
          <img className="me-3" src="https://getbootstrap.com/docs/5.3/assets/brand/bootstrap-logo-white.svg" width="48" height="38" alt="" />
          <div className="lh-1">
            <h1 className="h6 mb-0 text-white lh-1">Bootstrap</h1>
            <small>Since 2011</small>
          </div>
        </div>

        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <h6 className="border-bottom pb-2 mb-0">Recent updates</h6>

          {/* Example items */}
          {[ "#007bff", "#e83e8c", "#6f42c1" ].map((color, idx) => (
            <div key={idx} className="d-flex text-body-secondary pt-3">
              <svg className="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32">
                <rect width="100%" height="100%" fill={color}></rect>
              </svg>
              <p className="pb-3 mb-0 small lh-sm border-bottom">
                <strong className="d-block text-gray-dark">@username</strong>
                Placeholder update message from user {idx+1}.
              </p>
            </div>
          ))}

          <small className="d-block text-end mt-3">
            <a href="#">All updates</a>
          </small>
        </div>

        <div className="my-3 p-3 bg-body rounded shadow-sm">
          <h6 className="border-bottom pb-2 mb-0">Suggestions</h6>

          {[1,2,3].map((i) => (
            <div key={i} className="d-flex text-body-secondary pt-3">
              <svg className="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32">
                <rect width="100%" height="100%" fill="#007bff"></rect>
              </svg>
              <div className="pb-3 mb-0 small lh-sm border-bottom w-100">
                <div className="d-flex justify-content-between">
                  <strong className="text-gray-dark">Full Name</strong>
                  <a href="#">Follow</a>
                </div>
                <span className="d-block">@username</span>
              </div>
            </div>
          ))}

          <small className="d-block text-end mt-3">
            <a href="#">All suggestions</a>
          </small>
        </div>
      </main>
    </>
  );
}
