import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palmtree, ChevronRight, Copy, ExternalLink, Key, Link } from 'lucide-react';

const REDIRECT_URI = 'http://localhost:5173/callback';
const APP_NAME = 'Patronizer';
const APP_DESCRIPTION = 'Analytics dashboard for Patreon creators';

const steps = [
  {
    title: "Create a Patreon Client",
    description: "First, you'll need to create a client in the Patreon Developer Portal.",
    icon: <Link className="w-5 h-5" />,
    instructions: [
      {
        text: "1. Visit the Patreon Developer Portal",
        link: "https://www.patreon.com/portal/registration/oauth-client",
        linkText: "patreon.com/portal/registration/oauth-client"
      },
      "2. Sign in with your Patreon account",
      "3. Click 'Create Client'",
      {
        text: "4. Fill in the required information:",
        subItems: [
          {
            text: "Name:",
            value: APP_NAME,
            copyable: true
          },
          {
            text: "Description:",
            value: APP_DESCRIPTION,
            copyable: true
          },
          {
            text: "Redirect URI:",
            value: REDIRECT_URI,
            copyable: true,
            important: true
          }
        ]
      },
      {
        text: "5. Save your client and copy your Client ID and Client Secret",
        important: true
      }
    ]
  },
  {
    title: "Connect Your Page",
    description: "Enter your API credentials to connect your Patreon page.",
    icon: <ExternalLink className="w-5 h-5" />,
    isForm: true
  }
];

export default function Setup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would normally validate and store the credentials
    navigate('/dashboard');
  };

  const renderInstruction = (instruction: any, index: number) => {
    if (typeof instruction === 'string') {
      return <div className="text-zinc-400">{instruction}</div>;
    }

    return (
      <div className="space-y-3">
        <div className="text-zinc-400">{instruction.text}</div>
        {instruction.link && (
          <a
            href={instruction.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#f45d48] hover:text-[#f17c67] bg-zinc-800/50 px-3 py-2 rounded-lg"
          >
            {instruction.linkText}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {instruction.subItems && (
          <div className="ml-4 space-y-2">
            {instruction.subItems.map((item: any, i: number) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${
                  item.important ? 'bg-zinc-800/80' : 'bg-zinc-800/40'
                } p-3 rounded-lg`}
              >
                {typeof item === 'string' ? (
                  <div className="text-zinc-400">{item}</div>
                ) : (
                  <>
                    <div className="text-zinc-400">{item.text}</div>
                    {item.value && (
                      <div className="flex items-center gap-2 ml-auto">
                        <code className="px-2 py-1 bg-zinc-900 rounded text-[#f45d48]">
                          {item.value}
                        </code>
                        {item.copyable && (
                          <button
                            className="text-[#f45d48] hover:text-[#f17c67]"
                            onClick={() => navigator.clipboard.writeText(item.value)}
                            title={`Copy ${item.text.replace(':', '')}`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {instruction.important && (
          <div className="mt-2 text-[#f45d48] text-sm flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#f45d48]" />
            {instruction.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center">
            <Palmtree className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Patronizer Setup</h1>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full ${
                  index <= currentStep ? 'bg-[#f45d48]' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center">
                {steps[currentStep].icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {steps[currentStep].title}
                </h2>
                <p className="text-zinc-400">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>

          {!steps[currentStep].isForm ? (
            <div className="space-y-4">
              {steps[currentStep].instructions?.map((instruction, index) => (
                <div
                  key={index}
                  className="bg-zinc-800/40 p-4 rounded-lg"
                >
                  {renderInstruction(instruction, index)}
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
                  placeholder="Enter your Client ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
                  placeholder="Enter your Client Secret"
                  required
                />
              </div>
            </form>
          )}

          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-white rounded-lg hover:bg-zinc-800"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-[#f45d48] to-[#f17c67] text-white rounded-lg flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-[#f45d48] to-[#f17c67] text-white rounded-lg"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}