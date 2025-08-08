import { Product } from '../../domain/types';

/**
 * Datos de prueba específicos para la panadería Mandorla
 * Incluye productos realistas con ingredientes y alérgenos
 */
export const productosMandrola: Product[] = [
  {
    id: 'galleta-chocolate-001',
    name: 'Galleta de Chocolate Artesanal',
    description: 'Galleta casera con chips de chocolate belga y nueces, horneada diariamente',
    price: 15.99,
    originalPrice: 18.99,
    category: 'cookies',
    image: '/images/galleta-chocolate.jpg',
    inStock: true,
    featured: true,
    ingredients: ['harina integral', 'chocolate belga', 'nueces', 'mantequilla', 'azúcar morena'],
    allergens: ['gluten', 'frutos secos', 'lácteos']
  },
  {
    id: 'pan-centeno-002',
    name: 'Pan Integral de Centeno',
    description: 'Pan artesanal horneado diariamente con semillas de girasol y levadura natural',
    price: 25.50,
    category: 'breads',
    image: '/images/pan-centeno.jpg',
    inStock: true,
    ingredients: ['harina de centeno', 'semillas de girasol', 'levadura natural', 'sal marina'],
    allergens: ['gluten']
  },
  {
    id: 'croissant-almendra-003',
    name: 'Croissant de Almendra',
    description: 'Croissant francés tradicional relleno de crema de almendra casera',
    price: 18.75,
    category: 'pastries',
    image: '/images/croissant-almendra.jpg',
    inStock: false,
    featured: true,
    ingredients: ['harina', 'mantequilla francesa', 'almendras', 'azúcar', 'huevos'],
    allergens: ['gluten', 'frutos secos', 'lácteos', 'huevos']
  },
  {
    id: 'tarta-temporada-004',
    name: 'Tarta de Calabaza Especiada',
    description: 'Tarta de temporada con calabaza fresca y especias aromáticas',
    price: 32.00,
    category: 'seasonal',
    image: '/images/tarta-calabaza.jpg',
    inStock: true,
    featured: true,
    ingredients: ['calabaza fresca', 'canela', 'nuez moscada', 'masa quebrada', 'crema'],
    allergens: ['gluten', 'lácteos', 'huevos']
  }
];

export const categoriasPanaderia = ['cookies', 'pastries', 'breads', 'seasonal'] as const;

export const alergenosComunes = [
  'gluten',
  'lácteos', 
  'huevos',
  'frutos secos',
  'soja',
  'sesamo'
] as const;