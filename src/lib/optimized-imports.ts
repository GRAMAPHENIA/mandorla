/**
 * Importaciones optimizadas para tree shaking
 * Este archivo centraliza las importaciones de librerías grandes
 * para mejorar el tree shaking y reducir el bundle size
 */

// Importaciones optimizadas de Lucide React
export {
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  Trash2,
  Search,
  Filter,
  Star,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  Info,
  Loader2,
  Eye,
  EyeOff,
  Edit,
  Save,
  Settings,
  LogOut,
  Sun,
  Moon,
  ShoppingBag,
  CreditCard,
  Truck,
  Gift,
  Tag,
  Percent,
  Calendar,
  Image as ImageIcon,
  Upload,
  Download,
  Share,
  Copy,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Re-exportar componentes de Radix UI más utilizados
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@radix-ui/react-dialog';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut
} from '@radix-ui/react-dropdown-menu';

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from '@radix-ui/react-toast';

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@radix-ui/react-tooltip';

// Tipos comunes para evitar importaciones duplicadas
export type { 
  ComponentPropsWithoutRef,
  ElementRef,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  FormHTMLAttributes
} from 'react';

// Utilidades de fecha optimizadas
export {
  format,
  formatDistance,
  formatRelative,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  differenceInDays
} from 'date-fns';

// Utilidades de validación optimizadas
export {
  z,
  ZodSchema,
  ZodError,
  ZodIssue
} from 'zod';

export type {
  ZodType,
  ZodTypeDef,
  ZodTypeAny,
  infer as ZodInfer
} from 'zod';