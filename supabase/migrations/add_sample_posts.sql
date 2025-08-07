-- 添加示例帖子数据
-- 首先创建一些示例用户（如果不存在）
INSERT INTO public.users (id, username, email, password_hash, avatar_url, bio, is_verified, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'demo_user1', 'demo1@example.com', '$2b$10$dummy_hash_1', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20young%20developer&image_size=square', '热爱技术的开发者，专注于前端开发', true, true),
  ('22222222-2222-2222-2222-222222222222', 'demo_user2', 'demo2@example.com', '$2b$10$dummy_hash_2', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20designer%20avatar%20portrait&image_size=square', 'UI/UX设计师，喜欢创造美好的用户体验', true, true),
  ('33333333-3333-3333-3333-333333333333', 'demo_user3', 'demo3@example.com', '$2b$10$dummy_hash_3', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20enthusiast%20avatar%20portrait&image_size=square', '技术爱好者，全栈开发工程师', true, true)
ON CONFLICT (id) DO NOTHING;

-- 添加示例帖子
INSERT INTO public.posts (id, user_id, title, content, image_urls, likes_count, comments_count, shares_count, is_featured, visibility, created_at)
VALUES 
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '前端开发最佳实践分享',
    '今天想和大家分享一些前端开发的最佳实践。首先是代码组织，建议使用模块化的方式来组织代码，这样可以提高代码的可维护性和复用性。其次是性能优化，包括懒加载、代码分割、图片优化等技术。最后是用户体验，要注重页面的响应速度和交互体验。',
    ARRAY['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20web%20development%20workspace%20with%20multiple%20monitors&image_size=landscape_16_9'],
    15,
    8,
    3,
    true,
    'public',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    '设计系统的重要性',
    '设计系统是现代产品开发中不可或缺的一部分。它不仅能够保证产品的一致性，还能大大提高开发效率。一个好的设计系统应该包括颜色规范、字体规范、组件库、图标库等。通过建立完善的设计系统，团队可以更好地协作，产品也能保持统一的视觉风格。',
    ARRAY['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=design%20system%20components%20and%20style%20guide&image_size=landscape_4_3'],
    23,
    12,
    5,
    true,
    'public',
    NOW() - INTERVAL '4 hours'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '全栈开发技术栈选择',
    '作为一名全栈开发者，技术栈的选择非常重要。前端推荐React或Vue，后端可以选择Node.js、Python或Java，数据库可以使用PostgreSQL或MongoDB。重要的是要根据项目需求和团队技能来选择合适的技术栈，而不是盲目追求新技术。',
    NULL,
    18,
    6,
    2,
    false,
    'public',
    NOW() - INTERVAL '6 hours'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'React Hooks 深度解析',
    'React Hooks 是React 16.8引入的新特性，它让我们可以在函数组件中使用状态和其他React特性。useState用于管理组件状态，useEffect用于处理副作用，useContext用于消费Context，useMemo和useCallback用于性能优化。掌握这些Hooks对于现代React开发至关重要。',
    ARRAY['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20hooks%20code%20example%20on%20screen&image_size=landscape_16_9'],
    31,
    15,
    7,
    true,
    'public',
    NOW() - INTERVAL '1 day'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    '移动端设计趋势',
    '2024年移动端设计有几个重要趋势：1. 极简主义设计继续流行；2. 深色模式成为标配；3. 微交互增强用户体验；4. 个性化定制成为重点；5. 可访问性设计受到更多关注。设计师需要跟上这些趋势，创造更好的用户体验。',
    ARRAY['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20mobile%20app%20design%20trends%20showcase&image_size=portrait_16_9'],
    27,
    9,
    4,
    false,
    'public',
    NOW() - INTERVAL '1 day 12 hours'
  );

-- 添加一些评论
INSERT INTO public.comments (id, post_id, user_id, content, likes_count, created_at)
VALUES 
  ('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '很实用的分享，特别是性能优化的部分！', 3, NOW() - INTERVAL '1 hour'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '设计系统确实很重要，我们团队也在建设中', 2, NOW() - INTERVAL '3 hours'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Hooks真的改变了React开发方式', 5, NOW() - INTERVAL '20 hours');

-- 添加一些点赞
INSERT INTO public.likes (id, user_id, post_id, created_at)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 hour'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 hours'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '3 hours');

-- 检查权限并授予必要的访问权限
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.posts TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.comments TO anon;
GRANT SELECT ON public.comments TO authenticated;
GRANT SELECT ON public.likes TO anon;
GRANT SELECT ON public.likes TO authenticated;