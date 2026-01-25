
import { supabase } from "./supabaseClient";
import { LessonContent } from "./types";
import { guruDB, STORES } from "./utils/db";

export async function getGlobalLessonContent(lessonId: string, lang: string): Promise<LessonContent | null> {
  const key = `${lessonId}_${lang}`;

  // 1. Try Local IndexedDB (Offline/Cache)
  try {
    const localContent = await guruDB.get(STORES.CONTENT, key);
    if (localContent) {
      return localContent;
    }
  } catch (e) {
    console.warn("Local DB read failed", e);
  }

  // 2. Try Supabase (Cloud)
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('content')
      .eq('lesson_id', lessonId)
      .eq('type', 'lesson')
      .single();

    if (data?.content) {
      // Sync cloud content to local cache
      try {
        await guruDB.set(STORES.CONTENT, key, data.content);
      } catch (e) {}
      return data.content as LessonContent;
    }
  } catch (e) {
    console.warn("Cloud fetch failed", e);
  }

  return null;
}

export async function setGlobalLessonContent(lessonId: string, lang: string, content: LessonContent) {
  const key = `${lessonId}_${lang}`;

  // 1. Save Locally (Critical for Guest/Offline)
  try {
    await guruDB.set(STORES.CONTENT, key, content);
  } catch (e) {
    console.error("Local save failed", e);
  }

  // 2. Save to Cloud (If authenticated)
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    
    if (userId) {
      await supabase.from('contents').upsert({
        lesson_id: lessonId,
        type: 'lesson',
        content: content,
        created_by: userId
      });
    }
  } catch (e) {
    // Fail silently for guests or network errors, as local save succeeded
    console.log("Skipping cloud save (Guest or Network Error)");
  }
}

export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return data;
}

export async function updateProgress(userId: string, lessonId: string, category: string, status: string, score?: number) {
  await supabase.from('user_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    course_id: category,
    status: status,
    quiz_score: score,
    last_updated: new Date().toISOString()
  });
}
