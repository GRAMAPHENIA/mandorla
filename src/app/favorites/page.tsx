import { FavoritesList } from "../../components/favorites/favorites-list"

export const metadata = {
  title: "Tus Favoritos - Panadería Mandorla",
  description: "Tus productos favoritos guardados de Panadería Mandorla.",
}

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tus Favoritos</h1>
      <FavoritesList />
    </div>
  )
}
