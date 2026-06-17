import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Miozuki',
  description:
    'How Miozuki collects, uses, and discloses your personal information when you use our store and services.',
};

const linkClass =
  'text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Privacy Policy</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Privacy Policy
      </h1>
      <div className="h-px bg-charcoal/8 mb-6" />
      <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-10">
        Last updated: April 26, 2026
      </p>

      <div className="space-y-8 text-sm text-charcoal/65 leading-relaxed">

        <p>{`Miozuki operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). Miozuki is powered by Shopify, which enables us to provide the Services to you. This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.`}</p>

        <p>{`Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.`}</p>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Personal Information We Collect or Process</h2>
          <p className="mb-4">{`When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, including inferences drawn from this personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:`}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-charcoal font-medium">Contact details</strong>{` including your name, address, billing address, shipping address, phone number, and email address.`}</li>
            <li><strong className="text-charcoal font-medium">Financial information</strong>{` including credit card, debit card, and financial account numbers, payment card information, financial account information, transaction details, form of payment, payment confirmation and other payment details.`}</li>
            <li><strong className="text-charcoal font-medium">Account information</strong>{` including your username, password, security questions, preferences and settings.`}</li>
            <li><strong className="text-charcoal font-medium">Transaction information</strong>{` including the items you view, put in your cart, add to your wishlist, or purchase, return, exchange or cancel and your past transactions.`}</li>
            <li><strong className="text-charcoal font-medium">Communications with us</strong>{` including the information you include in communications with us, for example, when sending a customer support inquiry.`}</li>
            <li><strong className="text-charcoal font-medium">Device information</strong>{` including information about your device, browser, or network connection, your IP address, and other unique identifiers.`}</li>
            <li><strong className="text-charcoal font-medium">Usage information</strong>{` including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.`}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Personal Information Sources</h2>
          <p className="mb-4">{`We may collect personal information from the following sources:`}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-charcoal font-medium">Directly from you</strong>{` including when you create an account, visit or use the Services, communicate with us, or otherwise provide us with your personal information;`}</li>
            <li><strong className="text-charcoal font-medium">Automatically through the Services</strong>{` including from your device when you use our products or services or visit our websites, and through the use of cookies and similar technologies;`}</li>
            <li><strong className="text-charcoal font-medium">From our service providers</strong>{` including when we engage them to enable certain technology and when they collect or process your personal information on our behalf;`}</li>
            <li><strong className="text-charcoal font-medium">From our partners or other third parties.</strong></li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">How We Use Your Personal Information</h2>
          <p className="mb-4">{`Depending on how you interact with us or which of the Services you use, we may use personal information for the following purposes:`}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-charcoal font-medium">Provide, Tailor, and Improve the Services.</strong>{` We use your personal information to provide you with the Services, including to perform our contract with you, to process your payments, to fulfill your orders, to remember your preferences and items you are interested in, to send notifications to you related to your account, to process purchases, returns, exchanges or other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, to facilitate any returns and exchanges, to enable you to post reviews, and to create a customized shopping experience for you, such as recommending products related to your purchases. This may include using your personal information to better tailor and improve the Services.`}</li>
            <li><strong className="text-charcoal font-medium">Marketing and Advertising.</strong>{` We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you online advertisements for products or services on the Services or other websites, including based on items you previously have purchased or added to your cart and other activity on the Services.`}</li>
            <li><strong className="text-charcoal font-medium">Security and Fraud Prevention.</strong>{` We use your personal information to authenticate your account, to provide a secure payment and shopping experience, detect, investigate or take action regarding possible fraudulent, illegal, unsafe, or malicious activity, protect public safety, and to secure our services. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password or other access details with anyone else.`}</li>
            <li><strong className="text-charcoal font-medium">Communicating with You.</strong>{` We use your personal information to provide you with customer support, to be responsive to you, to provide effective services to you and to maintain our business relationship with you.`}</li>
            <li><strong className="text-charcoal font-medium">Legal Reasons.</strong>{` We use your personal information to comply with applicable law or respond to valid legal process, including requests from law enforcement or government agencies, to investigate or participate in civil discovery, potential or actual litigation, or other adversarial legal proceedings, and to enforce or investigate potential violations of our terms or policies.`}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">How We Disclose Personal Information</h2>
          <p className="mb-4">{`In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:`}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>{`With Shopify, vendors and other third parties who perform services on our behalf (e.g. IT management, payment processing, data analytics, customer support, cloud storage, fulfillment and shipping).`}</li>
            <li>{`With business and marketing partners to provide marketing services and advertise to you. For example, we use Shopify to support personalized advertising with third-party services based on your online activity with different merchants and websites. Our business and marketing partners will use your information in accordance with their own privacy notices. Depending on where you reside, you may have a right to direct us not to share information about you to show you targeted advertisements and marketing based on your online activity with different merchants and websites..`}</li>
            <li>{`When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship you products or through your use of social media widgets or login integrations.`}</li>
            <li>{`With our affiliates or otherwise within our corporate group.`}</li>
            <li>{`In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service or policies, and to protect or defend the Services, our rights, and the rights of our users or others.`}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Relationship with Shopify</h2>
          <p>
            {`The Services are hosted by Shopify, which collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in countries other than where you reside, in order to provide and improve the Services for you. In addition, to help protect, grow, and improve our business, we use certain Shopify enhanced features that incorporate data and information obtained from your interactions with our Store, along with other merchants and with Shopify. To provide these enhanced features, Shopify may make use of personal information collected about your interactions with our store, along with other merchants, and with Shopify. In these circumstances, Shopify is responsible for the processing of your personal information, including for responding to your requests to exercise your rights over use of your personal information for these purposes. To learn more about how Shopify uses your personal information and any rights you may have, you can visit the `}
            <a href="https://www.shopify.com/legal/privacy/app-users" target="_blank" rel="noopener noreferrer" className={linkClass}>Shopify Consumer Privacy Policy</a>
            {`. Depending on where you live, you may exercise certain rights with respect to your personal information here `}
            <a href="https://privacy.shopify.com/en" target="_blank" rel="noopener noreferrer" className={linkClass}>Shopify Privacy Portal</a>
            {`.`}
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Third Party Websites and Links</h2>
          <p>{`The Services may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Children&apos;s Data</h2>
          <p>{`The Services are not intended to be used by children, and we do not knowingly collect any personal information about children under the age of majority in your jurisdiction. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted. As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we "share" or "sell" (as those terms are defined in applicable law) personal information of individuals under 16 years of age.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Security and Retention of Your Information</h2>
          <p>{`Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee "perfect security." In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.`}</p>
          <p className="mt-3">{`How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide you with Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Your Rights and Choices</h2>
          <p className="mb-4">{`Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law.`}</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong className="text-charcoal font-medium">Right to Access / Know.</strong>{` You may have a right to request access to personal information that we hold about you.`}</li>
            <li><strong className="text-charcoal font-medium">Right to Delete.</strong>{` You may have a right to request that we delete personal information we maintain about you.`}</li>
            <li><strong className="text-charcoal font-medium">Right to Correct.</strong>{` You may have a right to request that we correct inaccurate personal information we maintain about you.`}</li>
            <li><strong className="text-charcoal font-medium">Right of Portability.</strong>{` You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.`}</li>
            <li><strong className="text-charcoal font-medium">Managing Communication Preferences.</strong>{` We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or orders that you have made.`}</li>
          </ul>
          <p className="mb-4">
            {`You may exercise any of these rights where indicated on the Services or by contacting us using the contact details provided below. To learn more about how Shopify uses your personal information and any rights you may have, including rights related to data processed by Shopify, you can visit `}
            <a href="https://privacy.shopify.com/en" target="_blank" rel="noopener noreferrer" className={linkClass}>https://privacy.shopify.com/en</a>
            {`.`}
          </p>
          <p>{`We will not discriminate against you for exercising any of these rights. We may need to verify your identity before we can process your requests, as permitted or required under applicable law. In accordance with applicable laws, you may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Complaints</h2>
          <p>{`If you have complaints about how we process your personal information, please contact us using the contact details provided below. Depending on where you live, you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">International Transfers</h2>
          <p>{`Please note that we may transfer, store and process your personal information outside the country you live in.`}</p>
          <p className="mt-3">{`If we transfer your personal information out of the European Economic Area or the United Kingdom, we will rely on recognized transfer mechanisms like the European Commission's Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Changes to This Privacy Policy</h2>
          <p>{`We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on this website, update the "Last updated" date and provide notice as required by applicable law.`}</p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Contact</h2>
          <p>
            {`Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please call or email us at `}
            <a href="mailto:info@miozuki.co.nz" className={linkClass}>info@miozuki.co.nz</a>
            {` or contact us at 7A Vienna Place, Birkenhead, Auckland, AUK, 0626, NZ`}
          </p>
        </div>
      </div>
    </main>
  );
}
