import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function PrivacyNotice() {
  return (
    <>
      <h1>OncoKB Privacy Notice</h1>
      <p>
        <strong>Last Updated: April 3rd, 2025</strong>
      </p>
      <p>
        The OncoKB<sup>TM</sup> Precision Oncology Knowledge Base (“
        <strong>OncoKB</strong>” or the “<strong>Platform</strong>”) is operated
        by Memorial Sloan Kettering Cancer Center (“<strong>MSK</strong>,” “
        <strong>we</strong>”, “<strong>our</strong>” or “<strong>us</strong>”).
        MSK is committed to the individual privacy of every user (defined below)
        of OncoKB.
      </p>
      <p>
        By providing your Personal Data to MSK or otherwise using OncoKB, you
        understand that we may collect, use, and disclose your information as
        described in this OncoKB Privacy Notice (this “
        <strong>Privacy Notice</strong>”). This Privacy Notice is not a contract
        and does not create any contractual rights or obligations.
      </p>
      <p>
        Please use these links to jump to any portion of this Privacy Notice
        that interests you or scroll down to read along.
      </p>
      <TableOfContents />
      <h2>What this Notice Covers</h2>
      <p>
        This Privacy Notice describes how we collect, use, and disclose the
        Personal Data (defined below) that we collect or receive through OncoKB.
      </p>
      <p>
        OncoKB is made available to users (“<strong>users</strong>”) via
        licenses which include different rights and permissions depending on the
        users’ use case, which include the following:
      </p>
      <ul>
        <li>
          <p>
            License for use of OncoKB data in a commercial product (a “
            <strong>Commercial Use License</strong>”);
          </p>
        </li>
        <li>
          <p>
            License for research use in a commercial setting (a “
            <strong>Commercial Research License</strong>”);
          </p>
        </li>
        <li>
          <p>
            License for patient services or reports in a hospital setting (a “
            <strong>Clinical Use License</strong>”); and
          </p>
        </li>
        <li>
          <p>
            License for research use in an academic setting (an “
            <strong>Academic Use License</strong>”).
          </p>
        </li>
      </ul>
      <p>
        Any information collected from users through the Platform will be used
        and disclosed in accordance with this Privacy Notice.
      </p>
      <h2>The Information We Collect and Use</h2>
      <p>
        When we use the term “<strong>Personal Data</strong>” we mean
        information that we directly associate with a specific person, or that
        we can reasonably use to identify a specific person such as a name or
        email address. We collect and use Personal Data through your use of
        OncoKB in the following ways:
      </p>
      <h3>1. Personal Data You Provide to Us</h3>
      <p>
        We collect Personal Data when you choose to share that information with
        us, including in the following ways.
      </p>
      <h4>
        <u>All OncoKB Users:</u>
      </h4>
      <ul>
        <li>
          <p>
            When you register to use OncoKB, you will be asked to submit
            Personal Data which may include your name, job title/position, and
            email address. We use this information to set up and administer your
            OncoKB account, provide services to you, and manage your account.
          </p>
        </li>
        <li>
          <p>
            We may collect Personal Data and use it to manage how we communicate
            with you. For example, we may use your email address to alert you
            that you have a message waiting in OncoKB.
          </p>
        </li>
      </ul>
      <h4>
        <u>
          Users with a Commercial Use License or a Commercial Research License:
        </u>
      </h4>
      <ul>
        <li>
          When you register for a Commercial Use License or a Commercial
          Research License, you will be asked to submit additional Personal Data
          which may include the company you work for, your business address,
          phone number, and a description of how you plan to use OncoKB. We use
          this information to set up and administer your OncoKB account.
        </li>
      </ul>
      <h4>
        <u>Users with a Clinical Use License:</u>
      </h4>
      <ul>
        <li>
          When you register for a Clinical Use License, you will be asked to
          submit additional Personal Data which may include the hospital you
          work for, your work address, phone number, and a description of how
          you plan to use OncoKB. We use this information to set up and
          administer your OncoKB account.
        </li>
      </ul>
      <h4>
        <u>An Academic Use License:</u>
      </h4>
      <ul>
        <li>
          <p>
            When you register for an Academic Use License, you will be asked to
            submit additional Personal Data which may include the institution or
            university you work for or are a student at, institution address,
            phone number, and a description of how you plan to use OncoKB. We
            use this information to set up and administer your OncoKB account.
          </p>
        </li>
        <li>
          <p>
            If you request access to download OncoKB content and/or API access
            to OncoKB, you will be asked to confirm your status as either a
            student or employee of the institution you are affiliated with.
          </p>
        </li>
      </ul>
      <h3>2. Information We Collect Automatically</h3>
      <p>
        We use certain technologies in OncoKB to automatically collect
        information during your use of OncoKB (“
        <strong>Other Information</strong>”). If we associate Other Information
        with Personal Data, we will treat the combined information as Personal
        Data in accordance with this Privacy Notice.
      </p>
      <p>
        The technologies we use to collect Personal Data and other information
        include the following:
      </p>
      <ul>
        <li>
          <p>
            <strong>
              <u>Web Log File Data</u>
            </strong>
            . Like most other websites or mobile applications, we collect some
            basic information automatically about you and store it in log files.
            This information may include IP address, device type, browser type,
            internet service provider, pages you visit from and pages you go to
            after leaving OncoKB, pages you visit on OncoKB, date and time
            stamp, and clickstream data. We use this information for the
            management and administration of OncoKB, to improve the content,
            overall performance and user experience on OncoKB, for fraud
            protection and for protecting our rights.
          </p>
        </li>
        <li>
          <p>
            <strong>
              <u>Data from Cookies and Other Data Collection Technologies</u>
            </strong>
            . We and our service providers use cookies, web beacons and similar
            technologies to manage OncoKB and to collect information about you
            when you use OncoKB. These technologies help us to recognize you,
            analyze your use of OncoKB and identify solutions for how to make
            OncoKB more useful. These technologies also allow us to enhance the
            usability of OncoKB by aggregating demographic and statistical data
            and providing this information to our service providers.
          </p>
        </li>
        <li>
          <p>
            <strong>
              <u>Information for Analytics</u>
            </strong>
            . We use analytics providers to help us track certain information
            about your activity in OncoKB, and to evaluate and measure the use
            and performance of OncoKB. We may combine this information with
            other information we have about you to help us improve OncoKB and
            our service to you.
          </p>
        </li>
      </ul>
      <p>
        Please see more information on analytics and data collection
        technologies and the choices you can make in the “Your Choices” section
        of this Privacy Notice.
      </p>
      <h3>3. Additional Uses of Personal Data</h3>
      <p>
        In addition to the uses described above, we may, consistent with our
        other legal obligations, use your Personal Data for the following
        purposes:
      </p>
      <ul>
        <li>
          <p>Maintaining, delivering and improving OncoKB and our services;</p>
        </li>
        <li>
          <p>
            Contacting you to respond to your requests or inquiries and provide
            support;
          </p>
        </li>
        <li>
          <p>
            Send you technical notices, updates, security alerts and support and
            administrative messages;
          </p>
        </li>
        <li>
          <p>
            Contacting you about programs, products, or services that we believe
            may be of interest to you, new service announcements, or event
            invitations;
          </p>
        </li>
        <li>
          <p>Developing new resources and services;</p>
        </li>
        <li>
          <p>Conducting, managing and growing our business operations;</p>
        </li>
        <li>
          <p>
            Preventing, investigating and providing notice of fraud, unlawful or
            criminal activity or unauthorized access to or use of Personal Data,
            OncoKB or our data systems, or to meet our legal obligations;
          </p>
        </li>
        <li>
          <p>
            Investigating and resolving disputes and security issues and
            enforcing our Portal Terms and Conditions; and
          </p>
        </li>
        <li>
          <p>
            Carrying out any other purpose for which the information was
            collected.
          </p>
        </li>
      </ul>
      <p>
        We also may use aggregated or de-identified information, which cannot
        reasonably be used to identify you. Once de-identified and aggregated so
        that data does not personally identify you (for example, we may
        aggregate data in order to improve our automation and improve care), it
        is no longer Personal Data. Such de-identified or aggregated information
        which does not identify individuals is not subject to this Privacy
        Notice.
      </p>
      <h2>How We Disclose Personal Data</h2>
      <p>
        We may disclose Personal Data collected through OncoKB as described in
        the sections above, for the reason(s) provided to you at the time we
        collect it, with your authorization or consent, and in the following
        ways:
      </p>
      <ul>
        <li>
          <p>
            <strong>
              <u>Third-Party Service Providers</u>
            </strong>
            . We may disclose Personal Data to vendors who perform services on
            our behalf, including, but not limited to helping us manage OncoKB,
            manage our communication channels and conduct analytics, and
            providers involved in hosting and monitoring OncoKB.
          </p>
        </li>
        <li>
          <p>
            <strong>
              <u>Affiliates</u>.
            </strong>{' '}
            We may disclose Personal Data between and among MSK and our current
            and future parents, affiliates, subsidiaries and other companies
            under common control and ownership.
          </p>
        </li>
        <li>
          <p>
            <strong>
              <u>Legal Process, Safety and Terms Enforcement</u>.
            </strong>{' '}
            We may disclose your Personal Data to legal or government regulatory
            authorities in response to a search warrant, subpoena, court order
            or other request for such information or to assist in
            investigations. We may also disclose your Personal Data to third
            parties in connection with claims, disputes or litigation, when
            otherwise required by law, if we determine such disclosure is
            necessary to protect the health and safety of us or our users or to
            enforce our legal rights or contractual commitments that users have
            made.
          </p>
        </li>
        <li>
          <p>
            <strong>
              <u>Business Transfers</u>.
            </strong>{' '}
            We may disclose Personal Data as a part of a corporate business
            transaction, such as a merger, acquisition, reorganization,
            divestiture, dissolution, joint venture or financing, bankruptcy or
            sale of all or a portion of our assets.
          </p>
        </li>
      </ul>
      <h2>Security</h2>
      <p>
        We seek to use reasonable physical, technical, and administrative
        measures designed to protect Personal Data within our organization.
        Unfortunately, no data transmission or storage system can be guaranteed
        to be 100% secure. If you have reason to believe that your interaction
        with us is no longer secure (for example, if you feel that the security
        of your account has been compromised), please immediately notify us as
        described in the &quot;Contact Us&quot; section below.
      </p>
      <h2>Links to Other Websites or Mobile Applications</h2>
      <p>
        OncoKB may contain links to websites or mobile applications owned and
        operated by third parties. Other websites may also reference or link to
        OncoKB. These other web sites are not controlled by MSK. A link to a
        third party’s website or mobile application does not imply an
        endorsement of that website’s or mobile application's content or
        services. This Privacy Notice does not apply to, and we are not
        responsible for, the privacy practices of third-party websites or mobile
        applications that are not owned by us. We encourage you to read privacy
        statements of any third-party websites or mobile applications to learn
        about their information practices. Visiting these other websites and
        mobile applications is at your own risk.
      </p>
      <h2>How we Respond to “Do Not Track” Signals</h2>
      <p>
        Some web browsers have “Do Not Track” or similar features that allow you
        to tell each website you visit that you do not want your activities on
        that website tracked. At present, OncoKB does not respond to “Do Not
        Track” signals and consequently, OncoKB will continue to collect
        information about you even if your browser’s “Do Not Track” feature is
        activated.
      </p>
      <h2>Notices to Individuals Located Outside of the United States</h2>
      <h3>
        1. Notice to Individuals Located in the United Kingdom, European
        Economic Area, and Switzerland
      </h3>
      <p>
        This Privacy Notice describes ways in which you may provide information
        to MSK using OncoKB. Personal Data about individuals located in the
        European Economic Area, United Kingdom, or Switzerland (generally
        referred to here as the “EU”) are subject to special protections under
        EU law when the processing of those data are within the scope of the
        European Union’s General Data Protection Regulation (EU Regulation
        2016/679), its incorporation into the laws of England and Wales,
        Scotland, and Northern Ireland by virtue of the UK European Union
        (Withdrawal) Act 2018 and/or the Swiss Federal Act on Data Protection,
        as applicable (together, the “GDPR”). This Notice to Individuals Located
        in the United Kingdom, European Economic Area, and Switzerland (the
        “GDPR OncoKB Notice”) applies to MSK’s processing of Personal Data that
        is within the scope of the GDPR, which we call collectively the “GDPR
        Processing Activities.” This GDPR OncoKB Notice applies only to GDPR
        Processing Activities involving Personal Data collected through OncoKB.
        When you use OncoKB to transfer your Personal Data to MSK in the United
        States for GDPR Processing Activities, MSK is a controller of this
        Personal Data.
      </p>
      <p>
        We rely on separate and overlapping bases to process your Personal Data
        lawfully. MSK will use the Personal Data provided through or collected
        on OncoKB only for the purposes described in this Privacy Notice. MSK’s
        legal bases for processing your Personal Data include providing you with
        the information or services that you have requested, furthering our
        legitimate interests, and your consent, if applicable. Legitimate
        interests that we rely on in processing your Personal Data include (i)
        improving and customizing OncoKB for you, (ii) understanding how OncoKB
        is being used, (iii) exploring ways to develop and grow our operations,
        (iv) ensuring the safety and security of OncoKB, and (v) enhancing
        protection against fraud, spam, harassment, intellectual property
        infringement, crime and security risks. Without the ability to collect
        and process your Personal Data, MSK would not be able to achieve those
        interests. We may also use your Personal Data for purposes, including
        scientific research if applicable, that are compatible with the purposes
        for which such data were initially collected.
      </p>
      <p>
        If our processing is based solely on consent, you have the right to
        withdraw your consent.
      </p>
      <p>
        You may withdraw your consent by contacting us as set forth in the
        “Contact Us” section below. Please note that, in certain cases, we may
        continue to process your Personal Data after you have withdrawn consent,
        if we have a legal basis to do so. For example, we may retain certain
        information if we need to do so to comply with an independent legal
        obligation, or if it is necessary to do so to pursue our legitimate
        interest in keeping OncoKB safe and secure.
      </p>
      <p>
        MSK is located in the United States. When you enter your Personal Data
        through OncoKB, the data may be transferred to, stored, and processed in
        the United States, and could be transferred to, stored and processed in
        another country outside of the EU. Please be aware that the appropriate
        EU government authorities have not found the United States, and possibly
        other countries to which your Personal Data may be transferred, to
        provide adequate safeguards for the protection of Personal Data.
        However, MSK will take steps to maintain the privacy of your Personal
        Data as described in this Privacy Notice. If MSK transfers your Personal
        Data outside the EU, we will do so in reliance on mechanisms recognized
        under the GDPR. This includes (i) transferring your Personal Data to
        countries that appropriate EU government authorities have determined to
        provide adequate data protection, (ii) obtaining your consent to
        transfer your Personal Data outside the EU after first informing you
        about the possible risks of such a transfer, (iii) transferring your
        information outside the EU if the transfer is necessary to the
        performance of a contract between you and MSK, or (iv) transferring your
        information outside the EU if necessary to establish, exercise or defend
        legal claims.
      </p>
      <p>
        We will retain your Personal Data for as long as is necessary for the
        purposes set out in this Privacy Notice (for example, if you have an
        account, for as long as your account is active), subject to your right,
        under certain circumstances, to have certain of your Personal Data
        erased, as discussed in the next paragraph, unless a longer period is
        required under applicable law or is needed to resolve disputes or
        protect our legal rights.
      </p>
      <p>
        If your Personal Data is processed for GDPR Processing Activities, you
        have the right to (1) see Personal Data that MSK holds about you and
        receive any details required to be provided to you under applicable law,
        (2) correct or update your Personal Data, if inaccurate, (3) limit
        collection and use of your Personal Data under certain circumstances
        (for example, if you think it is inaccurate), (4) receive your Personal
        Data in an electronic format as required by law, except Personal Data
        that has been used for public interest purposes or for MSK’s required
        legal obligations, (5) request deletion of your Personal Data, subject
        to MSK’s need to keep such data to comply with legal requirements, to
        preserve the integrity of a research study, or to allow MSK to defend
        itself from legal claims, and (6) file a complaint with a data
        protection authority (see{' '}
        <a href="https://ec.europa.eu/justice/article-29/structure/data-protection-authorities/index_en.htm">
          this link
        </a>
        ). If you have questions about the processing of your Personal Data or
        rights associated with your Personal Data, see the section “Contact Us”
        below.
      </p>
      <h3>
        2. Notice to Individuals Located in the People’s Republic of China
      </h3>
      <p>
        Individuals located in the People’s Republic of China are afforded
        certain protections where the handling of their Personal Data is within
        the scope of the Personal Information Protection Law of the People’s
        Republic of China (the “PIPL”).
      </p>
      <p>
        This notice applies to MSK’s processing of Personal Data that is within
        the scope of the PIPL, and describes how the information that you
        transmit to MSK via OncoKB will be used by MSK.
      </p>
      <p>
        In this notice, Personal Data shall have the same meaning as “Personal
        Information” under the PIPL. Personal Data includes information that
        relates to you, including but not limited to your name, address, and
        demographic information.
      </p>
      <p>
        MSK is a Handler of your Personal Data for the purposes of the PIPL.
      </p>
      <h4>Description of Personal Data Handling</h4>
      <p>MSK will handle your Personal Data for the following purposes:</p>
      <ul>
        <li>
          <p>
            To comply with MSK’s statutory duties, responsibilities, and
            obligations, including responding to requests of regulatory
            agencies.
          </p>
        </li>
        <li>
          <p>
            To establish and defend against legal claims. To support MSK’s
            business and institutional interests (for example, conducting
            quality assurance and improvement activities and managing MSK’s
            business operations.
          </p>
        </li>
        <li>
          <p>
            To respond to your questions and/or your requests to exercise your
            rights over your Personal Data as provided by the PIPL.
          </p>
        </li>
      </ul>
      <p>
        In order to achieve the purpose for which MSK will handle your Personal
        Data, MSK will handle the following categories of Personal Data.
      </p>
      <ul>
        <li>
          <p>
            Basic personal information, such as your name, date of birth,
            gender, family relation, address, personal phone number, or email.
          </p>
        </li>
        <li>
          <p>
            Personal identity information, such as your ID number, passport, or
            resident certificate.
          </p>
        </li>
        <li>
          <p>
            Personal property information, such as financial information or
            insurance information.
          </p>
        </li>
        <li>
          <p>Other information, such as emergency contacts.</p>
        </li>
      </ul>
      <p>
        MSK will retain your Personal Data for the period necessary to fulfill
        the purposes outline in this Privacy Notice, unless a different
        retention period is required by law.
      </p>
      <p>
        In order to achieve the above purposes, MSK will use various handling
        methods, including by collecting your Personal Data from you through
        email, secure web forms, physical mail, and/or digital portals. Once MSK
        receives your Personal Data, MSK will store your Personal Data in a data
        center owned by MSK, as well as in platforms owned by MSK or provided by
        entrusted persons designed to store such data.
      </p>
      <p>
        The following types of persons and entities at, or affiliated with, MSK,
        will handle your Personal Data in order to achieve the purposes outlined
        in this notice:
      </p>
      <ul>
        <li>
          Contractors, vendors, collaborating entities and other entrusted
          personnel that support OncoKB.
        </li>
      </ul>
      <h3>Your Rights Provided in the Law</h3>
      <p>
        You have certain rights with respect to your Personal Data as provided
        in the PIPL, including as follows:
      </p>
      <ul>
        <li>
          <p>
            You have the right to consult or copy Personal Data that MSK holds
            about you.
          </p>
        </li>
        <li>
          <p>
            You have the right request that your Personal Data be transferred to
            another Personal Data Handler. If you make this request, MSK will
            transfer your Personal Data or provide a channel through which you
            may transfer your Personal Data.
          </p>
        </li>
        <li>
          <p>
            You have the right to correct or update your Personal Data if it is
            inaccurate.
          </p>
        </li>
        <li>
          <p>
            You have the right to limit or refuse the collection and use of your
            Personal Data unless laws or administrative regulations stipulate
            otherwise.
          </p>
        </li>
        <li>
          <p>
            If information handling is based on your consent, you have the right
            to rescind consent.
          </p>
        </li>
        <li>
          <p>
            You have the right to request the deletion of your Personal Data.
            However, there are limits on your ability to request deletion of
            your Personal Data. For example, MSK may keep and use some or all of
            your Personal Data if necessary to comply with legal requirements,
            or where the deletion of your Personal Data is technically hard to
            realize, in which case MSK shall cease handling your Personal Data
            except for storage and shall take necessary security protective
            measures.
          </p>
        </li>
      </ul>
      <p>
        If you have questions about the processing of your Personal Data or
        rights associated with your Personal Data, see the section “Contact Us”
        below.
      </p>
      <h2>Changes to this Privacy Notice</h2>
      <p>
        We reserve the right to amend this Privacy Notice at any time. If we
        make changes, we will notify you by revising the “Last Updated” date at
        the top of this Privacy Notice and, in some cases, we may provide you
        with additional notice (such as adding a statement to our homepage or
        sending you a notification). Therefore, please check this Privacy Notice
        periodically for updates and to stay informed about our information
        practices.
      </p>
      <h3>Your Choices</h3>
      <h4>Account Information</h4>
      <p>
        You may request that we update, correct or delete information about you
        in OncoKB, or close your Portal account at any time by contacting us as
        described in the “Contact Us” section below. Please note that even if
        you close your account, we may retain certain information as required by
        law or for legitimate business purposes. We may also retain cached or
        archived copies of information about you for a certain period of time.
      </p>
      <h4>Cookies and Analytics Tools</h4>
      <p>
        You may enable or disable certain types of cookies via the cookie
        preference center, accessible by clicking the “Cookie preferences”
        button at the footer of <Link to="">www.oncokb.org</Link>. In addition,
        most browsers allow you to turn off certain cookies if you do not want
        your preferences tracked. However, you must enable strictly necessary
        cookies in your browser so you can use OncoKB. The “help” menu on most
        internet browsers contains information on how to control cookies, or you
        can visit{' '}
        <a href="http://www.aboutcookies.org/how-to-control-cookies/">
          www.aboutcookies.org/how-to-control-cookies/
        </a>
        .
      </p>
      <h2>Contact Us</h2>
      <p>
        If you need technical assistance with OncoKB you may contact MSK at{' '}
        <a href="mailto:contact@oncokb.org">contact@oncokb.org</a>.
      </p>
      <p>
        To ask questions about this Privacy Notice or other privacy-related
        matters, you may contact our Privacy Office in the following ways:
      </p>
      <p>
        MAILING ADDRESS:
        <br />
        Privacy Office
        <br />
        Memorial Sloan Kettering Cancer Center
        <br />
        633 Third Avenue
        <br />
        New York, NY 10017
      </p>
      <p>
        TELEPHONE:
        <br />
        646-227-2056
      </p>
      <p>
        EMAIL:
        <br />
        <a href="mailto:privacy@mskcc.org">privacy@mskcc.org</a>
      </p>
      <p>
        If you are in the European Union, you may address GDPR-related inquiries
        to our EU representative at:
      </p>
      <p>
        EU-REP.Global GmbH
        <br />
        Attn: MSKCC
        <br />
        Hopfenstr. 1d, 24114 Kiel, Germany
        <br />
        <a href="mailto:mskcc@eu-rep.global">mskcc@eu-rep.global</a>
      </p>
      <p>
        If you are in the United Kingdom, you may address UK GDPR
        privacy-related inquiries to our UK representative at:
      </p>
      <p>
        DP Data Protection Services UK Ltd.
        <br />
        Attn: MSKCC
        <br />
        16 Great Queen Street, Covent Garden, London, WC2B 5AH, United Kingdom
        <br />
        <a href="mailto:mskcc@eu-rep.global">mskcc@eu-rep.global</a>
      </p>
    </>
  );
}
