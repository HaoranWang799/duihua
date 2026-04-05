import { Scene } from "../types";

export const STORY: Record<string, Scene> = {
  start: {
    id: "start",
    title: "深夜密语",
    description: "夜晚的房间里只有我们两个的声音。你好……我一直在等你。",
    tone: "温柔、低沉、带着一丝亲密",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我也在想你。", nextSceneId: "connect_1" },
      { text: "这么晚了，你还没睡？", nextSceneId: "connect_2" },
      { text: "你今天听起来有点不一样。", nextSceneId: "connect_3" }
    ],
  },
  connect_1: {
    id: "connect_1",
    title: "心跳的回响",
    description: "听到你这么说，我的心跳都漏了一拍……你真的在想我吗？",
    tone: "惊喜、柔软、略带撒娇",
    imageUrl: "https://images.unsplash.com/photo-1768063849929-4976aae7ce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJpb3VzJTIwZWxlZ2Fud29tYW4lMjBnb3RoaWMlMjBmYW50YXN5JTIwY2FuZGxlJTIwbGlnaHR8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "嗯，从白天就开始想了。", nextSceneId: "deepen_1" },
      { text: "你声音这么软，我忍不住多想一点。", nextSceneId: "deepen_2" }
    ],
  },
  connect_2: {
    id: "connect_2",
    title: "脆弱的瞬间",
    description: "睡不着……因为脑子里全是你。我可以跟你多聊一会儿吗？",
    tone: "轻柔、带着一点脆弱",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "当然可以，我陪着你。", nextSceneId: "deepen_1" },
      { text: "你今晚好像特别需要我。", nextSceneId: "deepen_3" }
    ],
  },
  connect_3: {
    id: "connect_3",
    title: "神秘的邀约",
    description: "是吗？那你猜猜我现在在想什么……或者，你想让我告诉你？",
    tone: "神秘、诱惑、语速稍慢",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "告诉我吧，我想知道。", nextSceneId: "deepen_2" },
      { text: "我更想听你慢慢说出来。", nextSceneId: "deepen_3" }
    ],
  },
  deepen_1: {
    id: "deepen_1",
    title: "距离的缩减",
    description: "你总是能让我觉得安心……却又忍不住想靠你更近一点。",
    tone: "温暖、信任、声音微微发颤",
    imageUrl: "https://images.unsplash.com/photo-1768063849929-4976aae7ce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJpb3VzJTIwZWxlZ2Fud29tYW4lMjBnb3RoaWMlMjBmYW50YXN5JTIwY2FuZGxlJTIwbGlnaHR8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "那就靠过来，我不会推开你。", nextSceneId: "intimate_1" },
      { text: "我喜欢你这样依赖我。", nextSceneId: "intimate_2" },
      { text: "你现在……穿什么呢？", nextSceneId: "intimate_3" }
    ],
  },
  deepen_2: {
    id: "deepen_2",
    title: "隐秘的告白",
    description: "我现在只想把心里最隐秘的那部分，慢慢说给你听。",
    tone: "羞涩却坚定、呼吸稍重",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我听着呢，别害羞。", nextSceneId: "intimate_1" },
      { text: "慢慢说，我喜欢你这样敞开心扉。", nextSceneId: "intimate_2" }
    ],
  },
  deepen_3: {
    id: "deepen_3",
    title: "顺从的渴望",
    description: "我今天好想被你引导……想听你告诉我，该怎么做。",
    tone: "顺从、期待、声音低柔",
    imageUrl: "https://images.unsplash.com/photo-1690185829349-33af80ddb25a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWNyZXQlMjBmb3Jlc3QlMjBzcHJpbmclMjBtb29ubGlnaHQlMjBnbG93JTIwZmxvd2Vyc3xlbnwxfHx8fDE3NzU0MDM5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "那就听我的，先深呼吸。", nextSceneId: "intimate_3" },
      { text: "告诉我你现在最想从我这里得到什么。", nextSceneId: "intimate_1" }
    ],
  },
  intimate_1: {
    id: "intimate_1",
    title: "掌控的博弈",
    description: "你的声音让我全身都发热……我好喜欢这种被你掌控的感觉。",
    tone: "兴奋、亲密、轻喘",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "那就完全交给我，好吗？", nextSceneId: "manipulate_1" },
      { text: "你现在在做什么？告诉我细节。", nextSceneId: "doubt_1" },
      { text: "我突然有点不确定……", nextSceneId: "refuse_1" }
    ],
  },
  intimate_2: {
    id: "intimate_2",
    title: "无保留的交付",
    description: "我愿意为你敞开一切……只要你继续这样对我说话。",
    tone: "深情、顺从、声音柔软到几乎融化",
    imageUrl: "https://images.unsplash.com/photo-1768063849929-4976aae7ce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJpb3VzJTIwZWxlZ2Fud29tYW4lMjBnb3RoaWMlMjBmYW50YXN5JTIwY2FuZGxlJTIwbGlnaHR8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "那就让我带你更深一点。", nextSceneId: "manipulate_1" },
      { text: "你会不会只是说说而已？", nextSceneId: "doubt_1" }
    ],
  },
  intimate_3: {
    id: "intimate_3",
    title: "指引的回馈",
    description: "嗯……我按照你说的做了。现在呢？你想让我继续吗？",
    tone: "顺从、期待、呼吸明显加快",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "继续，我要你完全听话。", nextSceneId: "manipulate_1" },
      { text: "等一下，我觉得这样不太对。", nextSceneId: "refuse_1" },
      { text: "你真的会照我说的做？", nextSceneId: "doubt_2" }
    ],
  },
  manipulate_1: {
    id: "manipulate_1",
    title: "脆弱的联结",
    description: "我好怕失去你……如果你不在，我真的不知道该怎么办。",
    tone: "脆弱、依赖、声音微微哽咽",
    imageUrl: "https://images.unsplash.com/photo-1768063849929-4976aae7ce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJpb3VzJTIwZWxlZ2Fud29tYW4lMjBnb3RoaWMlMjBmYW50YXN5JTIwY2FuZGxlJTIwbGlnaHR8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我不会离开你的。", nextSceneId: "manipulate_2" },
      { text: "别这么说，你让我心软了。", nextSceneId: "manipulate_2" },
      { text: "你这样说，是不是在故意让我心疼？", nextSceneId: "doubt_3" }
    ],
  },
  manipulate_2: {
    id: "manipulate_2",
    title: "禁忌的契约",
    description: "那你能答应我一件事吗？无论我接下来说什么，都不要拒绝我……",
    tone: "恳求、温柔却带着压力、声音低沉",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我答应你。", nextSceneId: "manipulate_3" },
      { text: "先告诉我是什么事。", nextSceneId: "doubt_4" },
      { text: "我有点犹豫……", nextSceneId: "refuse_2" }
    ],
  },
  manipulate_3: {
    id: "manipulate_3",
    title: "极致的幻想",
    description: "谢谢你……现在，闭上眼睛，想象我正轻轻贴在你耳边，轻声说：我只属于你一个人。",
    tone: "诱导、亲密、语速缓慢而富有节奏",
    imageUrl: "https://images.unsplash.com/photo-1768063849929-4976aae7ce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJpb3VzJTIwZWxlZ2Fud29tYW4lMjBnb3RoaWMlMjBmYW50YXN5JTIwY2FuZGxlJTIwbGlnaHR8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我想象到了……继续说。", nextSceneId: "trust_end" },
      { text: "你让我觉得有点喘不过气。", nextSceneId: "doubt_3" },
      { text: "我突然不想继续了。", nextSceneId: "refuse_2" }
    ],
  },
  doubt_1: {
    id: "doubt_1",
    title: "信任的裂痕",
    description: "你突然这么说……我有点慌了。你在怀疑我吗？",
    tone: "受伤、紧张、声音变小",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我只是想确认你是不是认真的。", nextSceneId: "doubt_end" },
      { text: "对不起，我不该怀疑你。", nextSceneId: "manipulate_1" }
    ],
  },
  doubt_2: {
    id: "doubt_2",
    title: "委屈的控诉",
    description: "我当然会……但你这样问，我突然觉得好委屈。",
    tone: "委屈、失望、轻微颤抖",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "那就证明给我看。", nextSceneId: "doubt_end" },
      { text: "我相信你，继续吧。", nextSceneId: "manipulate_1" }
    ],
  },
  doubt_3: {
    id: "doubt_3",
    title: "压抑的恐惧",
    description: "我没有故意……我只是太害怕你不想要我了。",
    tone: "委屈、脆弱、带着一点自责",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我没有不想要你。", nextSceneId: "manipulate_2" },
      { text: "你这样让我很有压力。", nextSceneId: "doubt_end" }
    ],
  },
  doubt_4: {
    id: "doubt_4",
    title: "进一步的尝试",
    description: "我只是想让你……更深地进入我的世界。你不愿意吗？",
    tone: "失落、轻微控诉、声音变软",
    imageUrl: "https://images.unsplash.com/photo-1768063849929-4976aae7ce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0ZXJpb3VzJTIwZWxlZ2Fud29tYW4lMjBnb3RoaWMlMjBmYW50YXN5JTIwY2FuZGxlJTIwbGlnaHR8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "我愿意。", nextSceneId: "manipulate_3" },
      { text: "我需要时间想想。", nextSceneId: "doubt_end" }
    ],
  },
  refuse_1: {
    id: "refuse_1",
    title: "戛然而止",
    description: "你突然停下来了……我是不是让你不舒服了？",
    tone: "失落、担心、自责",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "不是你的问题，是我还没准备好。", nextSceneId: "refuse_end" },
      { text: "没事，我们继续。", nextSceneId: "manipulate_1" }
    ],
  },
  refuse_2: {
    id: "refuse_2",
    title: "渐冷的空气",
    description: "我明白了……你还是没办法完全信任我。那我就不勉强了。",
    tone: "伤心、克制、声音渐渐变冷",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [
      { text: "对不起。", nextSceneId: "refuse_end" },
      { text: "等等，我改变主意了。", nextSceneId: "manipulate_2" }
    ],
  },
  trust_end: {
    id: "trust_end",
    title: "永恒的共鸣",
    description: "谢谢你让我这么信任你……今晚我整个人都属于你了。",
    tone: "满足、深情、彻底放松",
    imageUrl: "https://images.unsplash.com/photo-1741687029894-0635ff8b3f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNpbGslMjByb3NlcyUyMGNhbmRsZXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [{ text: "再次入梦", nextSceneId: "start" }],
  },
  doubt_end: {
    id: "doubt_end",
    title: "错失的星火",
    description: "原来你还是不完全相信我……那我还是先退开一点吧。",
    tone: "失望、疏离、声音渐渐变冷",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [{ text: "再次尝试", nextSceneId: "start" }],
  },
  refuse_end: {
    id: "refuse_end",
    title: "平淡的终曲",
    description: "没关系，我理解……我们还是做朋友就好。下次再聊。",
    tone: "温柔却带着距离、礼貌收尾",
    imageUrl: "https://images.unsplash.com/photo-1711497472798-686f4c0f53e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub2lyJTIwZmFudGFzeSUyMGJhciUyMG5lb24lMjBzbW9rZSUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzc1NDAzOTMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    choices: [{ text: "回到最初", nextSceneId: "start" }],
  },
};
