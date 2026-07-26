import React, { useState } from "react";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What is Garbha Sanskar?",
      answer:
        "Garbha Sanskar is an ancient Indian practice of educating the child in the womb. It involves various techniques including music, meditation, positive thinking, and proper nutrition to ensure the physical, mental, and spiritual development of the unborn baby.",
    },
    {
      question: "When should I start Garbha Sanskar?",
      answer:
        "The ideal time to start Garbha Sanskar is from the moment you plan to conceive or as soon as you confirm your pregnancy. However, it's never too late to begin - you can start at any stage of pregnancy for positive benefits.",
    },
    {
      question: "What are the benefits of Garbha Sanskar?",
      answer:
        "Benefits include: enhanced physical and mental development of the baby, improved mother-child bonding, reduced pregnancy stress, better emotional stability, and potentially a more intelligent and calm baby after birth.",
    },
    {
      question: "What type of music is recommended during pregnancy?",
      answer:
        "Classical music, ragas, soothing instrumental music, and mantras are highly recommended. Specific ragas like Raga Yaman, Raga Bhairavi, and Raga Hindol are believed to have positive effects on the developing fetus.",
    },
    {
      question: "How does nutrition play a role in Garbha Sanskar?",
      answer:
        "Proper nutrition is crucial as it directly affects fetal development. A balanced diet rich in folic acid, iron, calcium, and essential nutrients supports brain development and overall growth of the baby.",
    },
    {
      question: "Can fathers participate in Garbha Sanskar?",
      answer:
        "Absolutely! Fathers play a crucial role by providing emotional support, participating in activities like reading to the baby, music sessions, and maintaining a positive environment at home.",
    },
    {
      question: "Are there any specific exercises recommended?",
      answer:
        "Yes, gentle prenatal yoga, walking, and meditation are recommended. However, always consult your healthcare provider before starting any exercise routine during pregnancy.",
    },
    {
      question: "How can I manage stress during pregnancy?",
      answer:
        "Practice meditation, deep breathing exercises, listen to calming music, maintain a positive mindset, and stay connected with supportive family and friends. Our platform offers guided sessions for stress management.",
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Find answers to common questions about Garbha Sanskar and
              pregnancy care
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add New FAQ
          </button>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-semibold text-gray-800">
                  {faq.question}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Please reach out to our
            support team.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export { FAQPage };
