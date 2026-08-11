/* ====== 全局类型定义 ====== */

/** 后端统一响应 */
export interface ApiResult<T> { code: number; msg: string; data: T }

/** 用户信息 */
export interface UserInfo { id: number; email: string; nickname: string; avatar?: string }

/** 登录/注册响应 */
export interface LoginResp { accessToken: string; refreshToken: string; expiresIn: number; userInfo: UserInfo }

/** 场景 */
export interface Scene { id: number; name: string; object: string; opening: string; initMood: number; relevantCats: string; goodResponse: string; isCustom: number }

/** 新建会话响应 */
export interface ChatStartResp { sessionId: number; opening: string; sceneId: number }

/** 对话消息 */
export interface ChatMsg { role: 'ai' | 'user'; text: string }

/** 分项评分（1-10） */
export interface SubScores { emotion: number; empathy: number; constructive: number; softness: number }

/** 评估报告 */
export interface Report {
  sessionId: number; totalScore: number; subEmotion: number; subEmpathy: number
  subConstructive: number; subSoftness: number; highlights: string[]; suggestions: string[]
  vocabReview: string[]; aiModel: string; sceneName: string; createdAt: string
}

/** 分页结果 */
export interface PageResult<T> { list: T[]; total: number; page: number; size: number }

/** 知识库文章 */
export interface KbArticle {
  id: number; categoryId: number; categoryName: string; title: string; cover?: string
  summary: string; content?: string; viewCount: number; likeCount: number
  tags: string[]; liked: boolean | null; createdAt: string
}

/** 知识库分类 */
export interface KbCategory { id: number; name: string; parentId: number; sort: number }
