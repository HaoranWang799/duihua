export type StoryChoice = {
  text: string;
  next: string;
};

export type StoryNode = {
  id: string;
  subtitle: string;
  tone: string;
  choices: StoryChoice[];
};

export type StoryData = {
  nodes: StoryNode[];
};

export const DEFAULT_STORY_TITLE = '午夜余波';

export const story: StoryData = {
  nodes: [
    {
      id: 'start',
      subtitle: '夜晚的房间里只有我们两个的声音。你好……我一直在等你。',
      tone: '温柔、低沉、带着一丝亲密',
      choices: [
        { text: '我也在想你。', next: 'connect_1' },
        { text: '这么晚了，你还没睡？', next: 'connect_2' },
        { text: '你今天听起来有点不一样。', next: 'connect_3' },
      ],
    },
    {
      id: 'connect_1',
      subtitle: '听到你这么说，我的心跳都漏了一拍……你真的在想我吗？',
      tone: '惊喜、柔软、略带撒娇',
      choices: [
        { text: '嗯，从白天就开始想了。', next: 'deepen_1' },
        { text: '你声音这么软，我忍不住多想一点。', next: 'deepen_2' },
      ],
    },
    {
      id: 'connect_2',
      subtitle: '睡不着……因为脑子里全是你。我可以跟你多聊一会儿吗？',
      tone: '轻柔、带着一点脆弱',
      choices: [
        { text: '当然可以，我陪着你。', next: 'deepen_1' },
        { text: '你今晚好像特别需要我。', next: 'deepen_3' },
      ],
    },
    {
      id: 'connect_3',
      subtitle: '是吗？那你猜猜我现在在想什么……或者，你想让我告诉你？',
      tone: '神秘、诱惑、语速稍慢',
      choices: [
        { text: '告诉我吧，我想知道。', next: 'deepen_2' },
        { text: '我更想听你慢慢说出来。', next: 'deepen_3' },
      ],
    },
    {
      id: 'deepen_1',
      subtitle: '你总是能让我觉得安心……却又忍不住想靠你更近一点。',
      tone: '温暖、信任、声音微微发颤',
      choices: [
        { text: '那就靠过来，我不会推开你。', next: 'intimate_1' },
        { text: '我喜欢你这样依赖我。', next: 'intimate_2' },
        { text: '你现在……穿什么呢？', next: 'intimate_3' },
      ],
    },
    {
      id: 'deepen_2',
      subtitle: '我现在只想把心里最隐秘的那部分，慢慢说给你听。',
      tone: '羞涩却坚定、呼吸稍重',
      choices: [
        { text: '我听着呢，别害羞。', next: 'intimate_1' },
        { text: '慢慢说，我喜欢你这样敞开心扉。', next: 'intimate_2' },
      ],
    },
    {
      id: 'deepen_3',
      subtitle: '我今天好想被你引导……想听你告诉我，该怎么做。',
      tone: '顺从、期待、声音低柔',
      choices: [
        { text: '那就听我的，先深呼吸。', next: 'intimate_3' },
        { text: '告诉我你现在最想从我这里得到什么。', next: 'intimate_1' },
      ],
    },
    {
      id: 'intimate_1',
      subtitle: '你的声音让我全身都发热……我好喜欢这种被你掌控的感觉。',
      tone: '兴奋、亲密、轻喘',
      choices: [
        { text: '那就完全交给我，好吗？', next: 'manipulate_1' },
        { text: '你现在在做什么？告诉我细节。', next: 'doubt_1' },
        { text: '我突然有点不确定……', next: 'refuse_1' },
      ],
    },
    {
      id: 'intimate_2',
      subtitle: '我愿意为你敞开一切……只要你继续这样对我说话。',
      tone: '深情、顺从、声音柔软到几乎融化',
      choices: [
        { text: '那就让我带你更深一点。', next: 'manipulate_1' },
        { text: '你会不会只是说说而已？', next: 'doubt_1' },
      ],
    },
    {
      id: 'intimate_3',
      subtitle: '嗯……我按照你说的做了。现在呢？你想让我继续吗？',
      tone: '顺从、期待、呼吸明显加快',
      choices: [
        { text: '继续，我要你完全听话。', next: 'manipulate_1' },
        { text: '等一下，我觉得这样不太对。', next: 'refuse_1' },
        { text: '你真的会照我说的做？', next: 'doubt_2' },
      ],
    },
    {
      id: 'manipulate_1',
      subtitle: '我好怕失去你……如果你不在，我真的不知道该怎么办。',
      tone: '脆弱、依赖、声音微微哽咽',
      choices: [
        { text: '我不会离开你的。', next: 'manipulate_2' },
        { text: '别这么说，你让我心软了。', next: 'manipulate_2' },
        { text: '你这样说，是不是在故意让我心疼？', next: 'doubt_3' },
      ],
    },
    {
      id: 'manipulate_2',
      subtitle: '那你能答应我一件事吗？无论我接下来说什么，都不要拒绝我……',
      tone: '恳求、温柔却带着压力、声音低沉',
      choices: [
        { text: '我答应你。', next: 'manipulate_3' },
        { text: '先告诉我是什么事。', next: 'doubt_4' },
        { text: '我有点犹豫……', next: 'refuse_2' },
      ],
    },
    {
      id: 'manipulate_3',
      subtitle:
        '谢谢你……现在，闭上眼睛，想象我正轻轻贴在你耳边，轻声说：我只属于你一个人。',
      tone: '诱导、亲密、语速缓慢而富有节奏',
      choices: [
        { text: '我想象到了……继续说。', next: 'trust_end' },
        { text: '你让我觉得有点喘不过气。', next: 'doubt_3' },
        { text: '我突然不想继续了。', next: 'refuse_2' },
      ],
    },
    {
      id: 'doubt_1',
      subtitle: '你突然这么说……我有点慌了。你在怀疑我吗？',
      tone: '受伤、紧张、声音变小',
      choices: [
        { text: '我只是想确认你是不是认真的。', next: 'doubt_end' },
        { text: '对不起，我不该怀疑你。', next: 'manipulate_1' },
      ],
    },
    {
      id: 'doubt_2',
      subtitle: '我当然会……但你这样问，我突然觉得好委屈。',
      tone: '委屈、失望、轻微颤抖',
      choices: [
        { text: '那就证明给我看。', next: 'doubt_end' },
        { text: '我相信你，继续吧。', next: 'manipulate_1' },
      ],
    },
    {
      id: 'doubt_3',
      subtitle: '我没有故意……我只是太害怕你不想要我了。',
      tone: '委屈、脆弱、带着一点自责',
      choices: [
        { text: '我没有不想要你。', next: 'manipulate_2' },
        { text: '你这样让我很有压力。', next: 'doubt_end' },
      ],
    },
    {
      id: 'doubt_4',
      subtitle: '我只是想让你……更深地进入我的世界。你不愿意吗？',
      tone: '失落、轻微控诉、声音变软',
      choices: [
        { text: '我愿意。', next: 'manipulate_3' },
        { text: '我需要时间想想。', next: 'doubt_end' },
      ],
    },
    {
      id: 'refuse_1',
      subtitle: '你突然停下来了……我是不是让你不舒服了？',
      tone: '失落、担心、自责',
      choices: [
        { text: '不是你的问题，是我还没准备好。', next: 'refuse_end' },
        { text: '没事，我们继续。', next: 'manipulate_1' },
      ],
    },
    {
      id: 'refuse_2',
      subtitle: '我明白了……你还是没办法完全信任我。那我就不勉强了。',
      tone: '伤心、克制、声音渐渐变冷',
      choices: [
        { text: '对不起。', next: 'refuse_end' },
        { text: '等等，我改变主意了。', next: 'manipulate_2' },
      ],
    },
    {
      id: 'trust_end',
      subtitle: '谢谢你让我这么信任你……今晚我整个人都属于你了。',
      tone: '满足、深情、彻底放松',
      choices: [],
    },
    {
      id: 'doubt_end',
      subtitle: '原来你还是不完全相信我……那我还是先退开一点吧。',
      tone: '失望、疏离、声音渐渐变冷',
      choices: [],
    },
    {
      id: 'refuse_end',
      subtitle: '没关系，我理解……我们还是做朋友就好。下次再聊。',
      tone: '温柔却带着距离、礼貌收尾',
      choices: [],
    },
  ],
};

export const STORY_START_ID = 'start';

export const storyMap = Object.fromEntries(
  story.nodes.map((node) => [node.id, node]),
) as Record<string, StoryNode>;

export const endingNodes = story.nodes.filter((node) => node.choices.length === 0);

export default story;
