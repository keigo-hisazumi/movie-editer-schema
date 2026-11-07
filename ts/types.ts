/* このファイルは scripts/gen-types.mjs が movie_editer_schema/schema.json から作る。手で書き換えない（npm run gen） */

/**
 * 元動画の時刻 "HH:MM:SS.mmm"（movie-editer の shorts/timefmt.py の hms）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Hms".
 */
export type Hms = string;
/**
 * 日時（ISO 8601）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "IsoTime".
 */
export type IsoTime = string;
/**
 * 元動画の区間 [開始, 終了]
 *
 * @minItems 2
 * @maxItems 2
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "HmsRange".
 */
export type HmsRange = [Hms, Hms];
/**
 * 元動画の区間 [開始, 終了]（秒）
 *
 * @minItems 2
 * @maxItems 2
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "SecRange".
 */
export type SecRange = [number, number];
/**
 * 出力画面の位置 [x, y]（px）
 *
 * @minItems 2
 * @maxItems 2
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Point".
 */
export type Point = [number, number];
/**
 * 間 [元動画の時刻, 秒]
 *
 * @minItems 2
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Pause".
 */
export type Pause = [Hms, number];
/**
 * ai：AI の下書き／human：人の手直し
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "EditBy".
 */
export type EditBy = 'ai' | 'human';
/**
 * draft：AI の下書き（/cut）／cut：カットの調整／captions：字幕の調整
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "EditStep".
 */
export type EditStep = 'draft' | 'cut' | 'captions';
/**
 * SourcesDoc の data の中身
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "SourceItems".
 */
export type SourceItems = SourceItem[];
/**
 * topics：トピックだけ／cut：選んだトピックのカット／learn：微調整した XML とカットの違いを学ぶ／short：微調整した XML からショート（いまはボタンを出していない）／scan：一覧を送り直すだけ
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "RequestAction".
 */
export type RequestAction = 'topics' | 'cut' | 'learn' | 'short' | 'scan';
/**
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "RequestStatus".
 */
export type RequestStatus = 'queued' | 'running' | 'done' | 'error';

/**
 * movie-editer（パイプライン）と movie-editer-viewer（ビューア）がやりとりするデータの形。Firestore のドキュメントと、その中の data（JSON 文字列）の中身。時刻は特に書かなければ元動画の秒
 */
export interface MovieEditerSchema {
  [k: string]: unknown;
}
/**
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "FileDesc".
 */
export interface FileDesc {
  name: string;
  desc: string;
}
/**
 * Firestore の videos/{動画名} のドキュメント（movie-editer の shorts/publish.py の publish）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "VideoDoc".
 */
export interface VideoDoc {
  /**
   * data の形式の版（SCHEMA_VERSION）
   */
  schema: number;
  /**
   * 動画名（元動画のファイル名から拡張子を除いたもの）
   */
  name: string;
  /**
   * 出力フォルダのファイルの最終更新
   */
  updated: string;
  /**
   * 送った日時
   */
  published: string;
  topics_count: number;
  shorts_count: number;
  /**
   * 段階式のカットの数（topic_XX/。前の版の publish には無い）
   */
  cuts_count?: number;
  /**
   * 出力フォルダの中身の要約（変わったかを見分ける。前の版の publish には無い）
   */
  sig?: string;
  /**
   * VideoData の JSON 文字列（Firestore は配列の中の配列を持てないため）
   */
  data: string;
}
/**
 * VideoDoc の data の中身（movie-editer の shorts/publish.py の build_data）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "VideoData".
 */
export interface VideoData {
  schema: number;
  name: string;
  updated: IsoTime;
  /**
   * 配信の長さ（秒。分からなければ null）
   */
  stream_length: number | null;
  /**
   * topics.yaml（無い・読めなければ null）
   */
  topics: Topic[] | null;
  topics_error: string;
  /**
   * 前の形式の topics.md だけがある
   */
  legacy_topics: boolean;
  /**
   * cuts.yaml（id はトピックの ID。無い・読めなければ null）
   */
  cuts?: CutSpec[] | null;
  cuts_error?: string;
  /**
   * topic_XX/ のカット・学習・ショートの状態
   */
  topic_cuts?: TopicCut[];
}
/**
 * topics.yaml の1トピック（movie-editer の shorts/topics.py）。start は元動画の秒
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Topic".
 */
export interface Topic {
  id: number;
  start: number;
  title: string;
  summary: string;
  points: string[];
}
/**
 * cuts.yaml の1項目（movie-editer の shorts/cutspec.py）。時刻は元動画の秒
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "CutSpec".
 */
export interface CutSpec {
  /**
   * トピックの ID
   */
  id: number;
  start: number;
  end: number;
  title: string;
  titles: string[];
  heading: string;
  summary: string;
  reason: string;
  drop: SecRange[];
  bgm: string | null;
  bgm_offset: number;
  bgm_db?: number | null;
  se: SoundCue[];
  images: ImageCue[];
}
/**
 * 効果音1つ（movie-editer の shorts/cutspec.py）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "SoundCue".
 */
export interface SoundCue {
  at: number;
  file: string;
  /**
   * 声との音量差（無ければ sound.se_db）
   */
  db: number | null;
}
/**
 * 重ねる画像・動画1つ（movie-editer の shorts/cutspec.py）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "ImageCue".
 */
export interface ImageCue {
  at: number;
  file: string;
  /**
   * 無ければ images.sec 秒
   */
  end: number | null;
  /**
   * 中心（出力の px。無ければ images の既定値）
   */
  pos?: Point | null;
  /**
   * 幅（px）。"band" で中央の帯いっぱい
   */
  width?: number | string | null;
}
/**
 * output/<動画名>/topic_XX/ のカット・微調整した XML・ショートの状態（movie-editer の shorts/topiccut.py の topic_summary）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "TopicCut".
 */
export interface TopicCut {
  /**
   * topic_XX
   */
  name: string;
  topic: number;
  files: string[];
  /**
   * cut.json（まだなら null）
   */
  cut: CutMemo | null;
  /**
   * 人が微調整して書き出した XML のファイル名
   */
  adjusted: string | null;
  adjusted_mtime: IsoTime | null;
  /**
   * ショートの memo.json（まだなら null）
   */
  memo: Memo | null;
  /**
   * learn.json の要約（まだなら null）
   */
  learn?: LearnBrief | null;
  /**
   * lessons.yaml（まだなら null）
   */
  lessons?: Lessons | null;
}
/**
 * topic_XX/cut.json（movie-editer の shorts/topiccut.py の make_cut）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "CutMemo".
 */
export interface CutMemo {
  topic: number;
  title: string;
  titles: string[];
  heading: string;
  summary: string;
  reason: string;
  start: Hms;
  end: Hms;
  duration: number;
  /**
   * 詰めたものの種類ごとの秒
   */
  removed: {
    [k: string]: number;
  };
  /**
   * 残した区間
   */
  cuts: HmsRange[];
  drop: HmsRange[];
  files: FileDesc[];
  made: IsoTime;
}
/**
 * topic_XX/memo.json（ショート。movie-editer の shorts/make_short.py）。いまの段階式では作らないので、どれも任意
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Memo".
 */
export interface Memo {
  spec?: {
    id?: number;
    title?: string;
    titles?: string[];
    summary?: string;
    reason?: string;
    start?: string;
    end?: string;
  };
  duration?: number;
  note?: string;
  start?: string;
  end?: string;
  snap?: string;
  removed?: {
    [k: string]: number;
  };
  cuts?: HmsRange[];
  drop?: HmsRange[];
  fillers?: {
    at: string;
    text: string;
  }[];
  texts?: {
    name: string;
    text: string;
    font: string;
    size: number;
    color: string;
  }[];
  bgm?: {
    name: string;
    from: number;
    db: number;
  } | null;
  se?: {
    at: number;
    name: string;
    db: number;
  }[];
  voice_db?: number | null;
  sound_notes?: string[];
  images?: {
    name: string;
    start: number;
    end: number;
  }[];
  image_notes?: string[];
  files?: FileDesc[];
  topic?: number;
  /**
   * 読み込んだ微調整の XML
   */
  source_xml?: string;
  source_notes?: string[];
}
/**
 * topic_XX/learn.json の要約（movie-editer の shorts/topiccut.py の _learn_brief）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "LearnBrief".
 */
export interface LearnBrief {
  adjusted_xml: string;
  adjusted_mtime: string;
  cut: Span;
  adjusted: Span;
  /**
   * +：人が頭を遅らせた
   */
  head: number;
  /**
   * -：人が終わりを早めた
   */
  tail: number;
  removed_sec: number;
  added_sec: number;
  counts: {
    [k: string]: number;
  };
  changes: LearnChange[];
  /**
   * 人が詰めた間
   */
  pauses_removed?: Pause[] | null;
  /**
   * 人が戻した間
   */
  pauses_added?: Pause[] | null;
  notes?: string[] | null;
  /**
   * 仕上がり（前の版の learn.json には無い）
   */
  finish?: Finish | null;
  made: string;
}
/**
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Span".
 */
export interface Span {
  start: Hms;
  end: Hms;
  duration: number;
  count: number;
}
/**
 * 文ごとの違い（movie-editer の shorts/learn.py）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "LearnChange".
 */
export interface LearnChange {
  start: Hms;
  end: Hms;
  text: string;
  /**
   * 外した・一部を外した・戻した・一部を戻した
   */
  change: string;
  /**
   * 一部を外した・戻した語
   */
  words?: string;
  /**
   * 戻した文がカットでなぜ外れていたか
   */
  why?: string;
  /**
   * 外した文が、仕上がりの元動画のクリップが無い所の文字に出ている（残しているかもしれない）
   */
  in_gap?: string;
}
/**
 * 人が Filmora で仕上げたショートの作り（movie-editer の shorts/finish.py。learn.json の finish）。時刻はショートの秒
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Finish".
 */
export interface Finish {
  xml: string;
  duration: number;
  size: Point;
  /**
   * 元動画のクリップの数
   */
  clips: number;
  /**
   * ずっと出ている文字（タイトル・見出し）
   */
  title: string | null;
  /**
   * カットの「見出し」「タイトル案N」と同じなら、その名前
   */
  title_match: string | null;
  zoom: {
    scale: number | null;
    pos: Point | null;
    sec: number;
    count: number;
  }[];
  /**
   * 元動画の順から動かしたクリップ（先出し）
   */
  moved: {
    start: number;
    end: number;
    src: string;
    said: string;
  }[];
  /**
   * 元動画のクリップが無い所と、そこに出ている文字
   */
  gaps: {
    start: number;
    end: number;
    texts: string[];
  }[];
  captions: {
    start: number;
    end: number;
    text: string;
  }[];
  caption_stats: {
    count: number;
    max_chars: number;
    avg_chars: number;
    avg_sec: number;
  };
  emphasis: {
    start: number;
    end: number;
    said?: string;
    text: string;
    track: number;
    over_caption: boolean;
  }[];
  images: {
    start: number;
    end: number;
    said?: string;
    name: string;
    track: number;
    scale: number | null;
    pos: Point | null;
  }[];
  se: {
    start: number;
    end: number;
    said?: string;
    name: string;
    track: number;
    db: number;
  }[];
  bgm: {
    start: number;
    end: number;
    said?: string;
    name: string;
    track: number;
    db: number;
    from: number;
  }[];
  notes: string[];
}
/**
 * topic_XX/lessons.yaml（cut：カットの直しから、short：仕上がりから）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "Lessons".
 */
export interface Lessons {
  cut: string[];
  short: string[];
}
/**
 * フレームの区間。start を含み end を含まない（fps は EditDoc.fps）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "FrameRange".
 */
export interface FrameRange {
  start: number;
  end: number;
}
/**
 * 字幕1つ。start・end は元動画のフレーム番号（end は含まない）。カットを直しても元の発話に付いたままになるよう、ショートの時刻でなく元動画の時刻で持つ
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "EditCaption".
 */
export interface EditCaption {
  start: number;
  end: number;
  /**
   * 表示する文字（1行）
   */
  text: string;
}
/**
 * topic_XX/edit.json（トピックの編集の記録。カットと字幕の正本で、XML・srt はここから作る）。保存のたびに revision を上げ、前の版は topic_XX/edits/ に残す
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "EditDoc".
 */
export interface EditDoc {
  /**
   * edit.json の形式の版
   */
  format: 1;
  /**
   * 動画名
   */
  video: string;
  topic: number;
  /**
   * フレームを数える fps（movie-editer の probe.py の edit_fps。可変フレームレートの録画も 30）
   */
  fps: number;
  /**
   * 版（1 から。保存のたびに +1）
   */
  revision: number;
  by: EditBy;
  step: EditStep;
  made: IsoTime;
  /**
   * 直したことのメモ（任意）
   */
  note?: string;
  /**
   * 残す区間（元動画のフレーム番号）。並び順がショートの順
   */
  keeps: FrameRange[];
  /**
   * 字幕（元動画のフレーム番号。ショートの時刻順）
   */
  captions: EditCaption[];
}
/**
 * Firestore の sources/learning（出力フォルダ直下の学び。movie-editer の shorts/publish.py の publish_learning）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "LearningDoc".
 */
export interface LearningDoc {
  updated: IsoTime;
  /**
   * cut_learning.md
   */
  cut: string;
  /**
   * short_learning.md
   */
  short: string;
}
/**
 * Firestore の sources/all（元動画の一覧。movie-editer の shorts/remote.py）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "SourcesDoc".
 */
export interface SourcesDoc {
  /**
   * 日時（ISO 8601）
   */
  updated: string;
  count: number;
  /**
   * SourceItem[] の JSON 文字列
   */
  data: string;
}
/**
 * video_dir の元動画1本と、その出力フォルダの状態（movie-editer の shorts/remote.py の scan_sources）
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "SourceItem".
 */
export interface SourceItem {
  /**
   * 動画名（出力フォルダ名）
   */
  name: string;
  /**
   * video_dir からの相対パス（依頼の video に使う）
   */
  rel: string;
  size: number;
  mtime: IsoTime;
  transcript: boolean;
  /**
   * topics.yaml の件数（無ければ null、読めなければ -1）
   */
  topics: number | null;
  /**
   * カットの数（topic_XX/）
   */
  cuts?: number;
  /**
   * ショートの数（topic_XX/）
   */
  topic_shorts?: number;
  /**
   * 微調整を学習したトピックの数
   */
  learned?: number;
}
/**
 * Firestore の requests/{id}。ビューアが queued で書き、movie-editer の watch（shorts/remote.py）が状態を書き戻す。created は Firestore の Timestamp なので JSON では形を決めない
 *
 * This interface was referenced by `MovieEditerSchema`'s JSON-Schema
 * via the `definition` "RequestDoc".
 */
export interface RequestDoc {
  action: RequestAction;
  /**
   * SourceItem.rel（scan は空）
   */
  video: string;
  /**
   * cut・learn・short のトピック ID
   */
  topics?: number[];
  status: RequestStatus;
  /**
   * Firestore の serverTimestamp()
   */
  created: {
    [k: string]: unknown;
  };
  /**
   * 依頼したユーザーのメールアドレス
   */
  by: string;
  started?: IsoTime;
  finished?: IsoTime;
  step?: string;
  /**
   * Claude Code の報告
   */
  log?: string;
  error?: string;
}
