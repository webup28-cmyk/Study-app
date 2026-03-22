/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Upload, 
  X, 
  CheckCircle2, 
  BookOpen,
  Layout,
  FileText,
  ChevronLeft,
  Layers,
  ClipboardList,
  GraduationCap,
  Cpu,
  Calculator,
  Atom,
  CircuitBoard,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  LogOut,
  User as UserIcon,
  Shield,
  Image as ImageIcon,
  Save,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  db, 
  auth, 
  googleProvider,
  UserProfile, 
  UserProgress, 
  AnswerData, 
  handleFirestoreError, 
  OperationType,
  getUserProfile,
  createUserProfile,
  getUserProgress,
  toggleProgress,
  getAnswer,
  updateAnswerData,
  getSubjects,
  addSubjectToDb,
  removeSubjectFromDb,
  getQuestions,
  addQuestionToDb,
  removeQuestionFromDb
} from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot, 
  collection, 
  deleteDoc 
} from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---
const ADMIN_EMAILS = ['bilalsabu3@gmail.com', 'bilalsabu437@gmail.com'];
const DEFAULT_ADMIN_PASSWORD = 'Bilal@888';

const ICON_MAP: Record<string, any> = {
  Cpu,
  Calculator,
  Atom,
  CircuitBoard,
  BookOpen
};

const MODULES = [
  { id: 1, name: 'Module 1' },
  { id: 2, name: 'Module 2', link: 'https://docs.google.com/presentation/d/1P8MDwFChI-fVXE5Kt0lH5yy_boxoWCla/edit?usp=drivesdk&ouid=116982004885539502522&rtpof=true&sd=true', ready: true },
  { id: 3, name: 'Module 3' },
  { id: 4, name: 'Module 4' },
];
const CONTENT_TYPES = [
  { id: 'qa', name: 'Question Bank', icon: ClipboardList },
  { id: 'notes', name: 'Study Notes', icon: FileText },
];
const SERIES = ['1', '2', 'Model'];

// --- Question Data ---
// ... existing questions ...
const PART_A_QUESTIONS = [
  "Convert (1101.001)2 into an equivalent decimal number.",
  "Describe the function of an instruction set and explain how it facilitates software –hardware interaction.",
  "Identify different registers in CPU and explain its functions.",
  "Differentiate between System Software and Application Software",
  "Discuss the importance of (i) simplex (ii) Half duplex and (iii) Full duplex in computer communication.",
  "Explain about assembly language and the role of assembler.",
  "Differentiate ASCII and Unicode character encoding schemes.",
  "Consider a multi-office company with each office site within the city. The offices are equipped with a network of computers. Explain the possible type of networks involved in the communication between two computers of the company.",
  "List any five basic Linux commands along with its usage",
  "Explain the different types of system software",
  "Differentiate logical shift and arithmetic shift operations with the help of an example",
  "Explain why is Unicode encoding better than ASCII? Is ASCII still important? Justify",
  "Illustrate unsigned integer representation and signed integer representation with an example.",
  "Quote the Linux commands for the following operations: (i) Create a directory (ii) List all the files and sub folders in a directory (iii) Copy the contents of a text file",
  "Explain how do packets help in sending messages efficiently",
  "Explain the difference between ASCII and Unicode character encoding systems.",
  "Discuss the importance of (i) Packets (ii) Medium and (iii) Protocol in computer communication",
  "Perform the following: a) 249.40 to binary. b) 110110.01 to decimal. c) Subtract 110 from 11001.",
  "Identify the different types of registers and explain their functions",
  "List any three types of instructions in computer architecture and provide an example for each.",
  "Differentiate system software and application software with examples.",
  "Briefly account for the key components of a computer network.",
  "Briefly explain the different data transmission types in computer communication.",
  "Define Unicode and state one advantage of Unicode over ASCII.",
  "Detail the functions of the Arithmetic Logic Unit (ALU) in a CPU?",
  "Point out the concept of fetch–execute cycle in a processor.",
  "What is an operating system? Mention any two functions of an operating system.",
  "Compare the concept of LAN, MAN and WAN.",
  "In which type of environments are Peer-to-Peer networks commonly used?"
];

const PART_B_QUESTIONS = [
  "Convert the following: a) (111011)2 → Decimal b) (92)10 → Binary c) (3F)16 → Decimal d) (54)8 → Binary e) 2’s complement of +5 and -5.",
  "Illustrate the step by step process of addition and subtraction of two binary numbers and solve. a) Perform Binary addition of 1101 and 0111 b) Perform Binary subtraction using 2's complement i) 7 – 2",
  "Narrate the role of registers in a CPU. Describe different types of registers such as Program Counter (PC), Instruction Register (IR), Memory Address Register(MAR), and Memory Data Register (MDR).",
  "Elucidate the instruction execution process in a CPU. Describe the stages involved from instruction fetching to execution.",
  "What are the various types of operating systems (OS), and how do network operating systems differ from distributed operating systems?",
  "Explicate different network topologies with diagrams (Bus, Star, Ring, Mesh).",
  "List out any eight basic commands used in Linux with suitable examples.",
  "Define an ISA. Compare RISC and CISC architectures with suitable examples.",
  "Explain assembly language and the role of assembler with a neat sketch.",
  "Illustrate the step by step process of addition and subtraction of two binary numbers and solve. Add: (11101)2 + (10011)2 Subtract: (110100)2 – (101011)2",
  "Explain the fetch-decode-execute cycle in detail, and describe the sequence of events that occur during instruction execution in a CPU.",
  "Illustrate the architecture and working of Client–Server networks with a neat diagram. Give any two real world examples.",
  "A new character encoding system is being developed for a multilingual application. Explain why Unicode would be preferred over ASCII for such purposes.",
  "Explain how signed numbers are represented in computers with appropriate example.",
  "Describe the main components of CPU with a block diagram",
  "Explain different instruction types with example.",
  "Explain about different network topologies and specify which topology can be used in critical networks where uptime and fault tolerance are crucial.",
  "A company has multiple offices in different cities and requires seamless data sharing. Compare the suitability of client-server and peer-to-peer networks for this purpose, and recommend the better option.",
  "Explain the types of network topologies with the help of neat sketches. Also mention the topology that can be used in critical networks where uptime and fault tolerance are crucial.",
  "Explain the Process Control Management in an Operating System, and how does the OS handle process creation, scheduling, and termination.",
  "Explain instruction format and discuss the basics of assembly language programming.",
  "Explain the characteristics of RISC and CISC architectures and highlight the differences between them.",
  "Describe the structure of an instruction format and explain the various types of instructions used in a CPU.",
  "Explain the functions of an operating system and describe its importance in a computer",
  "A company needs to set up a network. Should they use a peer-to-peer or client-server model? What are the key factors they should consider in making this choice?",
  "Explain available network topologies in computer networks. Identify a topology that is suitable for critical networks where high uptime and fault tolerance are required.",
  "List the basic components of a computer network and compare Client Server and P2P architectures with a real world example.",
  "Explain the role of an assembler in the execution of an assembly program with suitable diagram. Also, describe the use of the following instructions: a. LOAD X b. STORE X",
  "Explain the following using suitable examples: a. Sign Magnitude Representation b. One’s Complement Representation c. Two’s Complement Representation. Also, explain the steps for finding the 2’s complement of +5 and -5.",
  "Explain the Instruction execution cycle with an example.",
  "Explain the types of Network based on the area covered by the network.",
  "In a classroom computer lab, all computers need to connect to a central device for easy management. Which topology would be appropriate? Explain your choice.",
  "Explain the functions of an operating system and describe its importance in a computer system.",
  "Discuss various network topologies in computer network with its advantages and disadvantages",
  "Summarize Client Server Architecture and Peer to Peer architecture with the help of a diagram.",
  "Describe LAN, MAN and WAN with suitable diagrams.",
  "Convert the following: a. (48.46)10 to Binary b. (1000.11)2 to Decimal c. (2C9B)16 to Binary d. (257)8 to hexadecimal"
];

const PHYSICS_PART_A_QUESTIONS = [
  "Band diagrams of n-type & p-type",
  "Variation of intrinsic carrier concentration with temperature",
  "Prove that Fermi level in an intrinsic semiconductor lies in the middle of the band gap",
  "Distinguish between Zener diode & pn junction diode",
  "Any 3 applications of LED",
  "Any 3 advantages of solar cell",
  "Explain the formation of p-type semiconductor",
  "Working of LED",
  "Any 3 applications of photo detector"
];

const PHYSICS_PART_B_QUESTIONS = [
  { module: "Module 3", text: "Ideal diode equation derivation" },
  { module: "Module 3", text: "Thermal equilibrium concentration of electrons in the conduction band" },
  { module: "Module 3", text: "Thermal equilibrium concentration of holes in the valence band" },
  { module: "Module 3", text: "Describe the formation and working in forward biased and reverse biased conditions of pn junction diode" },
  { module: "Module 4", text: "Draw and explain V–I characteristics of solar cell and stringing of solar cell" },
  { module: "Module 4", text: "Discuss the V–I characteristics of Zener diode" },
  { module: "Module 4", text: "Construction and working of PN photodiode and junction photodiode" },
  { module: "Module 4", text: "Construction and working of half-wave rectifier and its efficiency" },
  { module: "Module 4", text: "Construction and working of full-wave rectifier and its efficiency" },
  { module: "Module 4", text: "Illustrate the working of tunnel diode and V–I characteristics" },
  { module: "Module 4", text: "Construction and working of semiconductor diode laser" }
];

// --- Types ---

// --- Components ---

interface QuestionCardProps {
  id: string;
  number: number;
  question: string;
  answer: AnswerData;
  onUpdate: (id: string, update: Partial<AnswerData>) => void;
  isStudied: boolean;
  isFavorite: boolean;
  onToggleStudied: () => void;
  onToggleFavorite: () => void;
  isAdmin: boolean;
}

const QuestionCard = ({ 
  id, 
  number, 
  question, 
  answer, 
  onUpdate,
  isStudied,
  isFavorite,
  onToggleStudied,
  onToggleFavorite,
  isAdmin
}: QuestionCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localText, setLocalText] = useState(answer.text || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalText(answer.text || '');
    }
  }, [answer.text, isFocused]);

  useEffect(() => {
    if (isFocused && localText !== answer.text) {
      const timeoutId = setTimeout(() => {
        onUpdate(id, { text: localText });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [localText, isFocused, answer.text, id, onUpdate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isAdmin) return;
    setLocalText(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localText !== answer.text) {
      onUpdate(id, { text: localText });
    }
  };

  const compressImage = (file: File, maxWidth: number = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const newImages = [...(answer.images || [])];
        for (const file of Array.from(files) as File[]) {
          const compressed = await compressImage(file);
          newImages.push(compressed);
        }
        onUpdate(id, { images: newImages });
      } catch (err) {
        console.error("Failed to process images", err);
        alert("Failed to process one or more images. Please try again with smaller files.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const removeImage = (index: number) => {
    if (!isAdmin) return;
    const newImages = [...(answer.images || [])];
    newImages.splice(index, 1);
    onUpdate(id, { images: newImages });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 mb-8 overflow-hidden relative"
      id={`q-${id}`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-4 sm:gap-5">
          <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg">
            {number}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
            {question}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-start">
          <button 
            onClick={onToggleStudied}
            className={cn(
              "p-2 sm:p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest",
              isStudied ? "bg-emerald-100 text-emerald-600 shadow-inner" : "bg-zinc-50 text-zinc-400 hover:text-zinc-600"
            )}
          >
            <CheckCircle className={cn("w-4 h-4 sm:w-5 sm:h-5", isStudied && "fill-current")} />
            <span className="hidden sm:inline">{isStudied ? 'Studied' : 'Mark Studied'}</span>
          </button>
          <button 
            onClick={onToggleFavorite}
            className={cn(
              "p-2 sm:p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest",
              isFavorite ? "bg-amber-100 text-amber-600 shadow-inner" : "bg-zinc-50 text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Star className={cn("w-4 h-4 sm:w-5 sm:h-5", isFavorite && "fill-current")} />
            <span className="hidden sm:inline">{isFavorite ? 'Favorite' : 'Add Favorite'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="bg-zinc-50 rounded-3xl p-4 sm:p-6 border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Answer Reference</h4>
            {isAdmin && (
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wider">
                <Shield className="w-3 h-3" /> Admin Edit Mode
              </span>
            )}
          </div>
          
          {isAdmin ? (
            <textarea
              value={localText}
              onChange={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder="Type the answer reference here..."
              className="w-full min-h-[150px] bg-transparent border-none focus:ring-0 text-zinc-800 placeholder:text-zinc-300 transition-all resize-y leading-relaxed"
            />
          ) : (
            <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {answer.text || <span className="text-zinc-300 italic">No answer reference provided yet.</span>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Visual Aids</h4>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Photo
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {(answer.images || []).map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-sm"
                >
                  <img src={img} alt="Answer attachment" className="w-full h-auto object-contain max-h-[800px]" referrerPolicy="no-referrer" />
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      title="Remove Image"
                      className="absolute top-4 right-4 p-3 bg-rose-500 text-white rounded-xl shadow-lg transition-all z-10 hover:scale-110 active:scale-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isAdmin && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-all bg-zinc-50/50 group"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
              </button>
            )}
            
            {!(answer.images?.length) && !isAdmin && (
              <div className="w-full py-12 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center text-zinc-300">
                <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">No visual aids available</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
          errorMessage = "You don't have permission to perform this action. If you're an admin, please check your login.";
        }
      } catch (e) {
        // Not JSON, use default or error.message
        if (error.message) errorMessage = error.message;
      }

      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-100">
            <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-zinc-500 font-medium mb-8 leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('qb-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setIsLoginLoading(true);
        try {
          const email = firebaseUser.email.toLowerCase();
          const existingProfile = await getUserProfile(email);
          
          if (existingProfile) {
            setUser(existingProfile);
          } else {
            const isAdminEmail = ADMIN_EMAILS.includes(email);
            const newProfile: UserProfile = {
              email,
              name: firebaseUser.displayName || 'Student',
              role: isAdminEmail ? 'admin' : 'student'
            };
            await createUserProfile(newProfile);
            setUser(newProfile);
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          setIsLoginLoading(false);
          setIsAuthReady(true);
        }
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [contentType, setContentType] = useState<'qa' | 'notes' | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [filterType, setFilterType] = useState<'all' | 'studied' | 'to-study' | 'favorites'>('all');
  
  const [userProgress, setUserProgress] = useState<UserProgress>({ studied: [], favorites: [] });
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, AnswerData>>({});
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFOC = useMemo(() => {
    if (!selectedSubject) return false;
    const subject = subjects.find(s => s.id === selectedSubject);
    const name = subject?.name.toLowerCase() || '';
    const id = selectedSubject.toLowerCase();
    return id.includes('foundation-of-computing') || 
           id.includes('foc') || 
           name.includes('foundation of computing') || 
           name.includes('foc');
  }, [selectedSubject, subjects]);

  const isPhysics = useMemo(() => {
    if (!selectedSubject) return false;
    const subject = subjects.find(s => s.id === selectedSubject);
    const name = subject?.name.toLowerCase() || '';
    const id = selectedSubject.toLowerCase();
    return id.includes('physics') || name.includes('physics');
  }, [selectedSubject, subjects]);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    
    localStorage.setItem('qb-user', JSON.stringify(user));
    const unsub = getUserProgress(user.email, setUserProgress);
    return () => unsub();
  }, [user, isAuthReady]);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setSubjects([]);
      return;
    }

    const unsub = getSubjects((fetchedSubjects) => {
      setSubjects(fetchedSubjects);
      
      // Seed "Foundation of Computing" if it doesn't exist and user is admin
      if (user?.role === 'admin' && fetchedSubjects.length === 0) {
        const initialSubject = {
          id: 'foundation-of-computing',
          name: 'Foundation of Computing',
          icon: 'BookOpen',
          color: 'bg-blue-500'
        };
        addSubjectToDb(initialSubject);
      }
    });
    return () => unsub();
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    setIsLoginLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      resetSelection();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addSubject = async () => {
    if (!newSubjectName.trim()) return;
    const id = newSubjectName.toLowerCase().replace(/\s+/g, '-');
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    await addSubjectToDb({ 
      id, 
      name: newSubjectName, 
      icon: 'BookOpen', 
      color: randomColor 
    });
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  const removeSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this subject?')) {
      await removeSubjectFromDb(id);
    }
  };

  const getQuestionContextId = useCallback((qId: string) => {
    const modulePart = contentType === 'notes' ? selectedModule : 'none';
    const seriesPart = contentType === 'qa' ? selectedSeries : 'none';
    return `${selectedSubject}-${modulePart}-${contentType}-${seriesPart}-${qId}`;
  }, [contentType, selectedModule, selectedSeries, selectedSubject]);

  const handleUpdateAnswer = useCallback(async (id: string, update: Partial<AnswerData>) => {
    const contextId = getQuestionContextId(id);
    setCurrentAnswers(prev => ({
      ...prev,
      [contextId]: {
        ...(prev[contextId] || { text: '', images: [] }),
        ...update
      }
    }));
    await updateAnswerData(contextId, update);
  }, [getQuestionContextId]);

  const toggleStudied = useCallback(async (id: string) => {
    if (!user) return;
    const isStudied = userProgress.studied.includes(id);
    await toggleProgress(user.email, 'studied', id, !isStudied);
  }, [user, userProgress.studied]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!user) return;
    const isFavorite = userProgress.favorites.includes(id);
    await toggleProgress(user.email, 'favorites', id, !isFavorite);
  }, [user, userProgress.favorites]);

  const [questions, setQuestions] = useState<{id: string, question: string, number: number}[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  // Load questions for the selected subject
  // Fetch custom questions from Firestore
  useEffect(() => {
    if (selectedSubject && selectedSeries && contentType === 'qa') {
      const unsubscribe = getQuestions(selectedSubject, selectedSeries, activeTab, (qs) => {
        setCustomQuestions(qs.map(q => ({ id: q.id, question: q.text, number: q.number, isCustom: true })));
      });
      return () => unsubscribe();
    } else {
      setCustomQuestions([]);
    }
  }, [selectedSubject, selectedSeries, activeTab, contentType]);

  useEffect(() => {
    if (selectedSubject) {
      setIsQuestionsLoading(true);
      if (isFOC && selectedSeries === '2') {
        const qnsA = PART_A_QUESTIONS.map((q, i) => ({ id: `A-${i}`, question: q, number: i + 1 }));
        const qnsB = PART_B_QUESTIONS.map((q, i) => ({ id: `B-${i}`, question: q, number: i + 1 }));
        setQuestions(activeTab === 'A' ? qnsA : qnsB);
      } else if (isPhysics && selectedSeries === '2') {
        const qnsA = PHYSICS_PART_A_QUESTIONS.map((q, i) => ({ id: `PHYSICS-A-${i}`, question: q, number: i + 1 }));
        const qnsB = PHYSICS_PART_B_QUESTIONS.map((q, i) => ({ id: `PHYSICS-B-${i}`, question: q.text, number: i + 1, module: q.module }));
        setQuestions(activeTab === 'A' ? qnsA : qnsB);
      } else {
        setQuestions([]);
      }
      setIsQuestionsLoading(false);
    } else {
      setQuestions([]);
    }
  }, [selectedSubject, activeTab, selectedSeries, subjects, isFOC, isPhysics]);

  const allQuestions = useMemo(() => {
    const merged = [...questions, ...customQuestions];
    return merged.sort((a, b) => a.number - b.number);
  }, [questions, customQuestions]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(item => {
      const matchesSearch = (item.question || '').toLowerCase().includes(deferredSearchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'studied') return (userProgress.studied || []).includes(item.id);
      if (filterType === 'to-study') return !(userProgress.studied || []).includes(item.id);
      if (filterType === 'favorites') return (userProgress.favorites || []).includes(item.id);
      return true;
    });
  }, [allQuestions, deferredSearchQuery, filterType, userProgress.studied, userProgress.favorites]);

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim() || !selectedSubject || !selectedSeries) return;
    
    const nextNumber = allQuestions.length + 1;
    await addQuestionToDb({
      text: newQuestionText,
      subjectId: selectedSubject,
      series: selectedSeries,
      part: activeTab,
      number: nextNumber
    });
    
    setNewQuestionText('');
    setIsAddingQuestion(false);
  };

  const handleRemoveQuestion = async (id: string) => {
    await removeQuestionFromDb(id);
  };

  const resetSelection = () => {
    setSelectedSubject(null);
    setSelectedModule(null);
    setContentType(null);
    setSelectedSeries(null);
  };

  useEffect(() => {
    if (selectedSubject && contentType && (selectedSeries || selectedModule)) {
      const unsubscribers: (() => void)[] = [];
      
      allQuestions.forEach(q => {
        const contextId = getQuestionContextId(q.id);
        const unsub = getAnswer(contextId, (data) => {
          setCurrentAnswers(prev => ({ ...prev, [contextId]: data }));
        });
        unsubscribers.push(unsub);
      });

      return () => unsubscribers.forEach(unsub => unsub());
    }
  }, [selectedSubject, contentType, selectedSeries, selectedModule, allQuestions, getQuestionContextId]);

  const currentSubject = subjects.find(s => s.id === selectedSubject);

  // --- View Logic ---

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-zinc-200 border border-zinc-100"
        >
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-zinc-200">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Study Hub</h1>
            <p className="text-zinc-400 font-medium text-center">Sign in with your Google account to access your materials and track progress.</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoginLoading}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoginLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserIcon className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>
          
          <p className="mt-8 text-center text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] leading-relaxed">
            Secure Student & Admin Access
          </p>
        </motion.div>
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Study Hub</h1>
              </div>
              <p className="text-zinc-500 text-lg font-medium">Welcome back, <span className="text-zinc-900 font-bold">{user.name}</span></p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {user.role === 'admin' && (
                <button
                  onClick={() => setIsAddingSubject(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  <Plus className="w-4 h-4" /> Add Subject
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-3 bg-white border border-zinc-200 text-zinc-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject: any) => {
              const IconComponent = ICON_MAP[subject.icon] || BookOpen;
              return (
                <motion.div
                  key={subject.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    if (subject.id === 'foundation-of-computing' || subject.name.toLowerCase() === 'foundation of computing') {
                      setContentType('qa');
                    }
                  }}
                  className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6 group relative cursor-pointer"
                >
                  {user.role === 'admin' && (
                    <button
                      onClick={(e) => removeSubject(e, subject.id)}
                      className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className={`w-14 h-14 ${subject.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-1">{subject.name}</h3>
                    <p className="text-sm text-zinc-500">4 Modules • Q&A & Notes</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {isAddingSubject && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Subject</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Subject Name</label>
                      <input
                        autoFocus
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="e.g. Data Structures"
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsAddingSubject(false)}
                        className="flex-1 p-4 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addSubject}
                        className="flex-1 p-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                      >
                        Add Subject
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const isQAAvailable = (isFOC && selectedSeries === '2') || (isPhysics && selectedSeries === '2') || customQuestions.length > 0;

  if (!contentType || (contentType === 'notes' && !selectedModule) || (contentType === 'qa' && !selectedSeries)) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={resetSelection}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Subjects
          </button>

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 ${currentSubject?.color} rounded-2xl flex items-center justify-center text-white`}>
                {currentSubject && (() => {
                  const Icon = ICON_MAP[currentSubject.icon] || BookOpen;
                  return <Icon className="w-7 h-7" />;
                })()}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{currentSubject?.name}</h1>
            </div>
            <p className="text-zinc-500 text-lg">Select an option to begin.</p>
          </header>

          <div className="space-y-12">
            {/* Content Type Selection */}
            <section>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Select Option</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setContentType(type.id as any);
                      setSelectedModule(null);
                      setSelectedSeries(null);
                    }}
                    className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center ${
                      contentType === type.id 
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]' 
                        : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${contentType === type.id ? 'bg-white/10' : 'bg-zinc-50'}`}>
                      <type.icon className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-xl">{type.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Series Selection (Only for Q&A) */}
            {contentType === 'qa' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Select Series / Model</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {SERIES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeries(s)}
                      className={`p-4 sm:p-6 rounded-2xl border-2 transition-all font-bold text-lg relative ${
                        selectedSeries === s 
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                          : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
                      } ${(isFOC || isPhysics) && s === '2' ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/5 ring-2 ring-indigo-500/20 scale-105' : ''}`}
                    >
                      {s === 'Model' ? 'Model' : `Series ${s}`}
                      {(isFOC || isPhysics) && s === '2' && (
                        <div className="absolute -top-3 -right-3 px-2 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1 animate-bounce">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Ready
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Module Selection (Only for Notes) */}
            {contentType === 'notes' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Select Module</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {MODULES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModule(m.id);
                        if (isFOC && m.id === 2 && m.link) {
                          window.open(m.link, '_blank');
                        }
                      }}
                      className={`p-4 sm:p-6 rounded-2xl border-2 transition-all font-bold text-lg relative ${
                        selectedModule === m.id 
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                          : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
                      }`}
                    >
                      {m.name}
                      {isFOC && m.id === 2 && m.ready && (
                        <div className="absolute -top-3 -right-3 px-2 py-1 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1">
                          Ready
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Uploading Soon View
  if (contentType === 'qa' && !isQAAvailable) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <Upload className="w-10 h-10 text-zinc-300 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">Uploading Soon</h2>
        <p className="text-zinc-500 max-w-md mb-8">
          We are currently working on adding questions for {currentSubject?.name} {selectedSeries === 'Model' ? 'Model Paper' : `Series ${selectedSeries}`}. Please check back later!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setSelectedSeries(null)}
            className="px-8 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Go Back
          </button>
          {user.role === 'admin' && (
            <button 
              onClick={() => setIsAddingQuestion(true)}
              className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Question
            </button>
          )}
        </div>
      </div>
    );
  }

  // Notes View (Placeholder)
  if (contentType === 'notes') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setContentType(null)}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Module Selection
          </button>
          
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center">
            <FileText className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2">Notes Coming Soon</h2>
            <p className="text-zinc-500">We are currently preparing the study notes for {currentSubject?.name} Module {selectedModule}.</p>
          </div>
        </div>
      </div>
    );
  }

  // Q&A View (The original app logic)
  const getPartCount = (part: 'A' | 'B') => {
    if (isFOC && selectedSeries === '2') {
      return part === 'A' ? PART_A_QUESTIONS.length : PART_B_QUESTIONS.length;
    }
    if (isPhysics && selectedSeries === '2') {
      return part === 'A' ? PHYSICS_PART_A_QUESTIONS.length : PHYSICS_PART_B_QUESTIONS.length;
    }
    if (activeTab === part) {
      return customQuestions.length;
    }
    return '?';
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Sidebar / Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <button 
            onClick={() => setSelectedSeries(null)}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 ${currentSubject?.color} rounded-lg flex items-center justify-center`}>
              {currentSubject && (() => {
                const Icon = ICON_MAP[currentSubject.icon] || BookOpen;
                return <Icon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <h1 className="font-bold text-lg tracking-tight truncate">{currentSubject?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {selectedModule && (
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-tighter">M{selectedModule}</span>
            )}
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-tighter">
              {selectedSeries === 'Model' ? 'Model' : `Series ${selectedSeries}`}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('A')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              activeTab === 'A' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layout className="w-4 h-4" />
              <span className="font-medium">Part A</span>
            </div>
            <span className="text-xs opacity-60">{getPartCount('A')}</span>
          </button>
          <button
            onClick={() => setActiveTab('B')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              activeTab === 'B' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Part B</span>
            </div>
            <span className="text-xs opacity-60">{getPartCount('B')}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        {/* Header */}
        <header 
          className={`sticky top-0 z-40 bg-[#F9F9F9]/80 backdrop-blur-md border-b border-zinc-200/50 px-6 py-4 transition-transform duration-300 ${
            isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedSeries(null)}
                className="lg:hidden w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold tracking-tight">
                    {activeTab === 'A' ? 'Part A: Short Questions' : 'Part B: Long Questions'}
                  </h2>
                  <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {selectedSeries === 'Model' ? 'Model' : `Series ${selectedSeries}`}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">
                  {filteredQuestions.length} questions found in {currentSubject?.name} {selectedModule ? `• M${selectedModule}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
                <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>All</button>
                <button onClick={() => setFilterType('studied')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'studied' ? 'bg-emerald-500 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>Studied</button>
                <button onClick={() => setFilterType('to-study')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'to-study' ? 'bg-amber-500 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>To Study</button>
                <button onClick={() => setFilterType('favorites')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'favorites' ? 'bg-rose-500 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>Favorites</button>
              </div>
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none w-full sm:w-64 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden flex border-t border-zinc-200 mt-4 -mx-6 px-6 pt-2">
            <button
              onClick={() => setActiveTab('A')}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'A' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'
              }`}
            >
              Part A
            </button>
            <button
              onClick={() => setActiveTab('B')}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'B' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'
              }`}
            >
              Part B
            </button>
          </div>
        </header>

        {/* Questions List */}
        <div className="max-w-4xl mx-auto p-6">
          {user.role === 'admin' && !(isFOC && selectedSeries === '2') && !(isPhysics && selectedSeries === '2') && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => setIsAddingQuestion(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-[2rem] hover:bg-zinc-800 transition-all shadow-xl font-bold text-sm uppercase tracking-widest"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                Add New Question
              </button>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {filteredQuestions.length > 0 ? (
              Object.entries(
                filteredQuestions.reduce((acc, item) => {
                  const mod = item.module || 'default';
                  if (!acc[mod]) acc[mod] = [];
                  acc[mod].push(item);
                  return acc;
                }, {} as Record<string, any[]>)
              ).map(([mod, items]: [string, any[]]) => (
                <div key={mod} className="mb-8">
                  {mod !== 'default' && (
                    <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3 ml-2">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Layers className="w-5 h-5" />
                      </div>
                      {mod}
                    </h2>
                  )}
                  {items.map((item) => {
                    const contextId = getQuestionContextId(item.id);
                    return (
                      <div key={item.id} className="relative group">
                        {user.role === 'admin' && item.isCustom && (
                          <button
                            onClick={() => handleRemoveQuestion(item.id)}
                            className="absolute right-2 top-2 sm:-right-4 sm:top-6 p-2 text-zinc-300 hover:text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10 bg-white shadow-md rounded-xl border border-zinc-100"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <QuestionCard
                          id={item.id}
                          number={item.number}
                          question={item.question}
                          answer={currentAnswers[contextId] || { text: '', images: [] }}
                          onUpdate={handleUpdateAnswer}
                          isStudied={(userProgress.studied || []).includes(item.id)}
                          isFavorite={(userProgress.favorites || []).includes(item.id)}
                          onToggleStudied={() => toggleStudied(item.id)}
                          onToggleFavorite={() => toggleFavorite(item.id)}
                          isAdmin={user.role === 'admin'}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-zinc-400"
              >
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No questions match your search</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-zinc-900 underline underline-offset-4 font-semibold"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Question Modal */}
        <AnimatePresence>
          {isAddingQuestion && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900">Add New Question</h2>
                    <button 
                      onClick={() => setIsAddingQuestion(false)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">Question Text</label>
                      <textarea
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all min-h-[120px]"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setIsAddingQuestion(false)}
                        className="flex-1 px-6 py-3 border border-zinc-200 text-zinc-600 font-semibold rounded-2xl hover:bg-zinc-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddQuestion}
                        className="flex-1 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-2xl hover:bg-zinc-800 transition-all shadow-lg"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
