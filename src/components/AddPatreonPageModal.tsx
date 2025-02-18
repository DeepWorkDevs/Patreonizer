import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Copy, ExternalLink, Key, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { createNotification } from '../lib/notifications';

const REDIRECT_URI = 'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-imojuhej--5173--7f809d15.local-credentialless.webcontainer-api.io/callback';
const APP_NAME = 'Patronizer';
const APP_DESCRIPTION = 'Analytics dashboard for Patreon creators';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  instructions?: Array<string | {
    text: string;
    link?: string;
    linkText?: string;
    subItems?: Array<{
      text: string;
      value?: string;
      copyable?: boolean;
      important?: boolean;
    }>;
    important?: boolean;
  }>;
  isForm?: boolean;
}

const steps: Step[] = [
  {
    title: "Create a Patreon Client",
    description: "First, you'll need to create a client in the Patreon Developer Portal.",
    icon: <Key className="w-5 h-5" />,
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

interface Props {
  onClose: () => void;
}

export default function AddPatreonPageModal({ onClose }: Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    clientSecret: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addPatreonPage = useStore(state => state.addPatreonPage);
  const user = useStore(state => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      await addPatreonPage({
        name: formData.name.trim(),
        clientId: formData.clientId.trim(),
        clientSecret: formData.clientSecret.trim(),
      });

      // Create success notification
      await createNotification(user.id, {
        title: 'Patreon Page Connected',
        message: `Successfully connected ${formData.name} to your account.`,
        type: 'success'
      });

      onClose();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error adding Patreon page:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect Patreon page');
    } finally {
      setIsLoading(false);
    }
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
            {instruction.subItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${
                  item.important ? 'bg-zinc-800/80' : 'bg-zinc-800/40'
                } p-3 rounded-lg`}
              >
                <div className="text-zinc-400">{item.text}</div>
                {item.value && (
                  <div className="flex items-center gap-2 ml-auto">
                    <code className="px-2 py-1 bg-zinc-900 rounded text-[#f45d48]">
                      {item.value}
                    </code>
                    {item.copyable && (
                      <button
                        className="text-[#f45d48] hover:text-[#f17c67]"
                        onClick={() => navigator.clipboard.writeText(item.value!)}
                        title={`Copy ${item.text.replace(':', '')}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {instruction.important && (
          <div className="mt-2 text-[#f45d48] text-sm flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#f45d48]" />
            Important: {instruction.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-xl font-semibold text-white">Add Patreon Page</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
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
                <h3 className="text-xl font-semibold text-white">
                  {steps[currentStep].title}
                </h3>
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
                  Page Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
                  placeholder="Enter a name for this page"
                  required
                />
              </div>
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

              {error && (
                <div className="text-[#f45d48] text-sm bg-[#f45d48]/10 p-4 rounded-lg">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}
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
                disabled={isLoading}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-[#f45d48] to-[#f17c67] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Page
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}