import { getDatabase, ref, push, set, get, update, remove, query as rtQuery, orderByChild, limitToLast } from "firebase/database";
import { getFirestore, collection, getDocs, doc, updateDoc, Timestamp, query, orderBy, getDoc } from "firebase/firestore";
import { app } from "./firebase";

// Initialize Firebase services
const db = getFirestore(app);
const database = getDatabase(app);

// --- TYPE DEFINITIONS ---
export interface Movie {
  id?: string;
  title: string;
  description: string;
  posterUrl: string;
  videoUrl: string;
  trailerUrl?: string;
  rating: number;
  duration: number;
  genre: string;
  releaseYear: number;
  displayCategories: string[];
  isFeatured: boolean;
  createdAt: number;
}

export interface Series {
  id?: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl?: string;
  rating: number;
  genre: string;
  releaseYear: number;
  seasons: number;
  displayCategories: string[];
  isFeatured: boolean;
  createdAt: number;
}

export interface Episode {
  id?: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  createdAt: number;
}

export interface Advert {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  createdAt: number;
}

export interface HeroImage {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  createdAt: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
  subscription?: {
    plan: string;
    expiresAt: Date;
    isActive: boolean;
  };
  createdAt?: Date;
  lastActive?: Date;
  watchTime?: number;
}

// --- Caching ---
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// --- Realtime Database Functions ---
const moviesRef = ref(database, "movies");
const seriesRef = ref(database, "series");
const episodesRef = ref(database, "episodes");
const advertsRef = ref(database, "adverts");
const heroImagesRef = ref(database, "heroImages");

async function addToRealtimeDB(ref: any, data: any) {
  const newRef = push(ref);
  const newData = { ...data, createdAt: Date.now() };
  await set(newRef, newData);
  return newRef.key;
}

// Movies (Realtime DB)
export async function addMovie(movie: Omit<Movie, "id" | "createdAt">) {
  return addToRealtimeDB(moviesRef, movie);
}

export async function getMovies(limitVal = 20): Promise<Movie[]> {
  const cacheKey = `movies_${limitVal}`;
  const cached = getCachedData<Movie[]>(cacheKey);
  if (cached) return cached;

  const q = rtQuery(moviesRef, orderByChild("createdAt"), limitToLast(limitVal));
  const snapshot = await get(q);

  if (snapshot.exists()) {
    const movies: Movie[] = [];
    snapshot.forEach((child) => {
      movies.push({ id: child.key!, ...child.val() } as Movie);
    });
    const result = movies.reverse();
    setCachedData(cacheKey, result);
    return result;
  }
  return [];
}

export async function getMovie(id: string): Promise<Movie | null> {
    const movieRef = ref(database, `movies/${id}`);
    const snapshot = await get(movieRef);
    if (snapshot.exists()) {
        return { id: snapshot.key!, ...snapshot.val() } as Movie;
    }
    return null;
}

export async function updateMovie(id: string, updates: Partial<Movie>) {
    const movieRef = ref(database, `movies/${id}`);
    await update(movieRef, updates);
}

export async function deleteMovie(id: string) {
    const movieRef = ref(database, `movies/${id}`);
    await remove(movieRef);
}

// Series (Realtime DB)
export async function addSeries(series: Omit<Series, "id" | "createdAt">) {
    return addToRealtimeDB(seriesRef, series);
}

export async function getSeries(limitVal = 20): Promise<Series[]> {
    const cacheKey = `series_${limitVal}`;
    const cached = getCachedData<Series[]>(cacheKey);
    if (cached) return cached;

    const q = rtQuery(seriesRef, orderByChild("createdAt"), limitToLast(limitVal));
    const snapshot = await get(q);

    if (snapshot.exists()) {
        const seriesArr: Series[] = [];
        snapshot.forEach((child) => {
            seriesArr.push({ id: child.key!, ...child.val() } as Series);
        });
        const result = seriesArr.reverse();
        setCachedData(cacheKey, result);
        return result;
    }
    return [];
}

export async function getSeriesById(id: string): Promise<Series | null> {
    const singleSeriesRef = ref(database, `series/${id}`);
    const snapshot = await get(singleSeriesRef);
    if (snapshot.exists()) {
        return { id: snapshot.key!, ...snapshot.val() } as Series;
    }
    return null;
}

// Episodes (Realtime DB)
export async function addEpisode(episode: Omit<Episode, "id" | "createdAt">) {
    return addToRealtimeDB(episodesRef, episode);
}

export async function getEpisodesBySeriesId(seriesId: string): Promise<Episode[]> {
    const q = rtQuery(episodesRef, orderByChild('seriesId'));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const episodes: Episode[] = [];
        snapshot.forEach((child) => {
            const episode = { id: child.key!, ...child.val() } as Episode;
            if (episode.seriesId === seriesId) {
                episodes.push(episode);
            }
        });
        return episodes.sort((a, b) => {
            if (a.seasonNumber !== b.seasonNumber) {
                return a.seasonNumber - b.seasonNumber;
            }
            return a.episodeNumber - b.episodeNumber;
        });
    }
    return [];
}

async function getAllEpisodes(): Promise<Episode[]> {
    const snapshot = await get(episodesRef);
    if (snapshot.exists()) {
        const episodes: Episode[] = [];
        snapshot.forEach((child) => {
            episodes.push({ id: child.key!, ...child.val() } as Episode);
        });
        return episodes;
    }
    return [];
}

// Adverts (Realtime DB)
export async function addAdvert(advert: Omit<Advert, "id" | "createdAt">) {
    return addToRealtimeDB(advertsRef, advert);
}

export async function getAdverts(limitVal = 10): Promise<Advert[]> {
    const cacheKey = `adverts_${limitVal}`;
    const cached = getCachedData<Advert[]>(cacheKey);
    if (cached) return cached;

    const q = rtQuery(advertsRef, orderByChild("createdAt"), limitToLast(limitVal));
    const snapshot = await get(q);

    if (snapshot.exists()) {
        const adverts: Advert[] = [];
        snapshot.forEach((child) => {
            adverts.push({ id: child.key!, ...child.val() } as Advert);
        });
        const result = adverts.reverse();
        setCachedData(cacheKey, result);
        return result;
    }
    return [];
}

// Hero Images (Realtime DB)
export async function addHeroImage(heroImage: Omit<HeroImage, "id" | "createdAt">) {
    return addToRealtimeDB(heroImagesRef, heroImage);
}

export async function getHeroImages(limitVal?: number): Promise<HeroImage[]> {
    const q = limitVal ? rtQuery(heroImagesRef, orderByChild("createdAt"), limitToLast(limitVal)) : heroImagesRef;
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const heroImages: HeroImage[] = [];
        snapshot.forEach((child) => {
            heroImages.push({ id: child.key!, ...child.val() } as HeroImage);
        });
        return heroImages.reverse();
    }
    return [];
}

// --- Firestore Functions ---
const usersCollection = collection(db, "users");

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const q = query(usersCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const users: UserData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || "Unknown",
        email: data.email || "",
        isAdmin: data.isAdmin || false,
        avatar: data.avatar,
        subscription: data.subscription
          ? {
              plan: data.subscription.plan,
              expiresAt: data.subscription.expiresAt?.toDate() || new Date(),
              isActive: data.subscription.expiresAt?.toDate() > new Date(),
            }
          : undefined,
        createdAt: data.createdAt?.toDate(),
        lastActive: data.lastActive?.toDate(),
        watchTime: data.watchTime || 0,
      });
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function updateUserSubscription(userId: string, plan: string, days: number) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      subscription: {
        plan,
        expiresAt: Timestamp.fromDate(expiresAt),
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
}

// --- Combined Functions ---
export async function getMoviesByCategory(category: string, limitVal?: number): Promise<Movie[]> {
  const movies = await getMovies();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filtered = movies.filter((movie) => {
    if (category === "recently-added") {
      return movie.createdAt > oneWeekAgo;
    }
    return movie.displayCategories?.includes(category);
  });

  return limitVal ? filtered.slice(0, limitVal) : filtered;
}

export async function getRelatedMovies(movieId: string, genre: string, limitVal = 6): Promise<Movie[]> {
  const movies = await getMovies();
  const related = movies.filter((movie) => movie.id !== movieId && movie.genre.toLowerCase() === genre.toLowerCase());
  related.sort((a, b) => b.rating - a.rating);
  return related.slice(0, limitVal);
}

export async function getSeriesByCategory(category: string, limitVal?: number): Promise<Series[]> {
    const series = await getSeries();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
    const filtered = series.filter((item) => {
      if (category === "recently-added") {
        return item.createdAt > oneWeekAgo;
      }
      return item.displayCategories?.includes(category);
    });
  
    return limitVal ? filtered.slice(0, limitVal) : filtered;
}

export async function getRelatedSeries(seriesId: string, genre: string, limitVal = 6): Promise<Series[]> {
    const series = await getSeries();
    const related = series.filter((item) => item.id !== seriesId && item.genre.toLowerCase() === genre.toLowerCase());
    related.sort((a, b) => b.rating - a.rating);
    return related.slice(0, limitVal);
}

export async function getContentStats() {
    try {
      const [movies, series, episodes] = await Promise.all([getMovies(), getSeries(), getAllEpisodes()]);
  
      return {
        totalMovies: movies.length,
        totalSeries: series.length,
        totalEpisodes: episodes.length,
      };
    } catch (error) {
      console.error("Error fetching content stats:", error);
      return {
        totalMovies: 0,
        totalSeries: 0,
        totalEpisodes: 0,
      };
    }
}
  
export async function getFeaturedContent(limitVal = 5): Promise<(Movie | Series)[]> {
    const cacheKey = `featured_${limitVal}`;
    const cached = getCachedData<(Movie | Series)[]>(cacheKey);
    if (cached) return cached;
  
    const [movies, series] = await Promise.all([getMovies(20), getSeries(20)]);
  
    const featuredMovies = movies.filter((movie) => movie.isFeatured);
    const featuredSeries = series.filter((item) => item.isFeatured);
  
    const allFeatured = [...featuredMovies, ...featuredSeries].sort((a, b) => b.createdAt - a.createdAt);
    const result = limitVal ? allFeatured.slice(0, limitVal) : allFeatured;
  
    setCachedData(cacheKey, result);
    return result;
}

export async function getRecentlyAdded(limitVal = 12): Promise<(Movie | Series)[]> {
    const cacheKey = `recent_${limitVal}`;
    const cached = getCachedData<(Movie | Series)[]>(cacheKey);
    if (cached) return cached;
  
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const [movies, series] = await Promise.all([getMovies(20), getSeries(20)]);
  
    const recentContent = [...movies, ...series].filter((item) => item.createdAt >= oneWeekAgo);
    recentContent.sort((a, b) => b.createdAt - a.createdAt);
  
    const result = limitVal ? recentContent.slice(0, limitVal) : recentContent;
    setCachedData(cacheKey, result);
    return result;
}
