import React from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Repeat, 
  MessageSquare, 
  HelpCircle, 
  Wrench, 
  CheckCircle2 
} from 'lucide-react';

export const SupportSection: React.FC = () => {
  const faqs = [
    {
      q: 'Where is your physical showroom located in Rajbiraj?',
      a: 'We are located at Main Road (Near Mahavir Chowk / Station Road), Rajbiraj, Saptari District, Madhesh Province, Nepal. We welcome you to visit, inspect appliances in person, and discuss exchange or financing.'
    },
    {
      q: 'How does the Free Delivery within 5 km work?',
      a: 'Any appliance purchase delivered within 5 km radius of Rajbiraj market is delivered completely FREE of charge with our in-house delivery van and technicians. For addresses outside 5 km or neighboring districts, standard regional freight is arranged.'
    },
    {
      q: 'Can I exchange my old appliance for a new Samsung product?',
      a: 'Yes! Under the official Samsung Smart Exchange program at Khan Electronics, you can bring in or schedule a doorstep inspection of any old brand refrigerator, washing machine, or TV to receive an instant trade-in valuation up to Rs. 25,000 towards your new Samsung unit.'
    },
    {
      q: 'What are the rules, documents, and interest rates for appliance financing?',
      a: 'Eligible appliances (minimum NPR 30,000) require a 40% down payment. For tenures of 6, 9, or 12 months, interest is 0%; for 24 months, a flat 7.99% interest is applied on the 60% loan balance. Documents required: Only your Nepali Citizenship (Nagarikta) and 2 passport-size photographs of the applicant and guarantor. Important: The contact mobile number must be officially registered in your own name as per your Citizenship.'
    },
    {
      q: 'Can I get repair and service if I bought my appliance from another shop or Kathmandu?',
      a: 'Absolutely! Our certified service center supports all customers in Saptari and nearby areas regardless of where the appliance was purchased. We stock genuine manufacturer spare parts and offer doorstep home inspection.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD), Fonepay QR / Mobile Banking scans, eSewa, Khalti, and major Visa/Mastercard debit and credit cards.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Showroom & Contact Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Store Information & Customer Care
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900">
          Visit or Contact Khan Electronics Rajbiraj
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Serving the families and businesses of Saptari, Siraha, and Madhesh Province with genuine home electronics for over two decades.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Showroom Address */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Showroom Address</h3>
            <p className="text-slate-600 leading-relaxed">
              <strong className="text-slate-900">New Khan Automobiles & Electronics</strong><br />
              Main Road (Near Mahavir Chowk)<br />
              Rajbiraj, Saptari District<br />
              Madhesh Province, Nepal
            </p>
          </div>
          <span className="text-emerald-700 font-bold block pt-2 border-t border-slate-100">
            Free Delivery within 5 km
          </span>
        </div>

        {/* Phone & Direct Contact */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Phone Numbers</h3>
            <div className="space-y-1.5 text-slate-600">
              <div>Mobile / WhatsApp: <a href="tel:9804781290" className="text-amber-700 font-bold hover:underline">9804781290</a></div>
              <div>Showroom Landline: <a href="tel:031520114" className="text-slate-800 font-semibold hover:underline">031-520114</a></div>
              <div>Service Desk: <span className="text-slate-500 font-medium">9812345678</span></div>
            </div>
          </div>
          <a
            href="https://wa.me/9779804781290"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 font-bold flex items-center gap-1 hover:underline pt-2 border-t border-slate-100"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp
          </a>
        </div>

        {/* Opening Hours */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Opening Hours</h3>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Sunday – Friday:</span>
                <span className="font-semibold text-slate-900">9:00 AM – 7:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday (Hatia Day):</span>
                <span className="font-semibold text-amber-700">Open Full Day</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Technicians available 6 days a week for in-home emergency visits.
              </p>
            </div>
          </div>
          <span className="text-slate-500 text-[11px] block pt-2 border-t border-slate-100">
            Showroom Air-Conditioned for Comfort
          </span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-amber-800 text-sm flex items-start gap-2">
                <span className="text-amber-600">Q.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-slate-600 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
