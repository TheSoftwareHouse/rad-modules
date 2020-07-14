/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : "") + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/">Getting started</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/changelog">Changelog</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-api-docs/">RAD Modules API Doc</a>
          </div>
          <div>
            <h5>Services</h5>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/security-index">Security</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/mailer-index">Mailer</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/notifications-index">Notifications</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/serverless-index">Serverless functions</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/scheduler-index">Scheduler</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/pdf-index">Pdf generator</a>
            <a href="https://thesoftwarehouse.github.io/rad-modules-docs/docs/rad-admin-panel-index">Admin panel</a>
          </div>
          <div>
            <h5>Support:</h5>
            <a href="https://github.com/TheSoftwareHouse/rad-modules-docs">GitHub</a>
            <a href="mailto:hello@tsh.io">hello@tsh.io</a>
          </div>
        </section>

        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
