-- 更新示例活动数据，包含不同状态的活动
-- 清除现有示例数据
DELETE FROM activity_registrations;
DELETE FROM activities;

-- 插入包含不同状态的示例活动数据
INSERT INTO activities (
    id,
    title,
    description,
    content,
    image_url,
    start_date,
    end_date,
    registration_start,
    registration_end,
    location,
    max_participants,
    current_participants,
    price,
    status,
    category,
    tags,
    organizer_id,
    is_featured
) VALUES
-- 筹备中的活动（未来开始）
(
    gen_random_uuid(),
    '2024年春季编程马拉松',
    '为期48小时的编程挑战赛，展示你的创新能力',
    '这是一场激动人心的编程马拉松活动，参与者将在48小时内完成一个完整的项目。我们提供丰富的奖品和专业导师指导。',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20hackathon%20event%20with%20developers%20coding%20together%20modern%20tech%20atmosphere&image_size=landscape_16_9',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '32 days',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    '北京科技园区',
    100,
    15,
    0,
    'preparing',
    '技术',
    ARRAY['编程', '竞赛', '创新'],
    (SELECT id FROM auth.users LIMIT 1),
    true
),
-- 进行中的活动（当前时间内）
(
    gen_random_uuid(),
    '设计思维工作坊',
    '学习设计思维方法论，提升创新能力',
    '通过实践案例学习设计思维的核心方法，包括用户研究、原型设计、测试验证等环节。适合产品经理、设计师和创业者参与。',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=design%20thinking%20workshop%20creative%20brainstorming%20session%20modern%20office&image_size=landscape_16_9',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '4 hours',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 day',
    '上海创新中心',
    50,
    35,
    299,
    'ongoing',
    '设计',
    ARRAY['设计', '工作坊', '创新'],
    (SELECT id FROM auth.users LIMIT 1),
    false
),
-- 已结束的活动
(
    gen_random_uuid(),
    'AI技术分享会',
    '探讨人工智能的最新发展趋势',
    '邀请行业专家分享AI技术的最新进展，包括机器学习、深度学习、自然语言处理等领域的前沿技术和应用案例。',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20technology%20conference%20presentation%20futuristic%20tech%20meeting&image_size=landscape_16_9',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '6 days',
    '深圳科技大厦',
    200,
    180,
    0,
    'completed',
    '技术',
    ARRAY['AI', '技术', '分享'],
    (SELECT id FROM auth.users LIMIT 1),
    true
),
-- 另一个筹备中的活动
(
    gen_random_uuid(),
    '创业项目路演',
    '优秀创业项目展示和投资对接',
    '为创业者提供展示项目的平台，邀请知名投资人和行业专家参与评审，促进项目与资本的对接。',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=startup%20pitch%20event%20business%20presentation%20modern%20conference%20room&image_size=landscape_16_9',
    NOW() + INTERVAL '15 days',
    NOW() + INTERVAL '15 days 6 hours',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '12 days',
    '广州创业园',
    80,
    25,
    199,
    'preparing',
    '商业',
    ARRAY['创业', '投资', '路演'],
    (SELECT id FROM auth.users LIMIT 1),
    false
),
-- 已取消的活动
(
    gen_random_uuid(),
    '户外团建活动',
    '因天气原因取消的户外活动',
    '原计划的户外团建活动，包括徒步、野餐和团队游戏。由于天气原因暂时取消，后续会重新安排。',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20team%20building%20activity%20nature%20hiking%20cancelled&image_size=landscape_16_9',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days 8 hours',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '5 days',
    '郊外公园',
    60,
    40,
    99,
    'cancelled',
    '娱乐',
    ARRAY['户外', '团建', '取消'],
    (SELECT id FROM auth.users LIMIT 1),
    false
),
-- 另一个已结束的活动
(
    gen_random_uuid(),
    '产品经理训练营',
    '系统学习产品管理知识和技能',
    '为期三天的产品经理训练营，涵盖需求分析、产品设计、项目管理、数据分析等核心技能。',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=product%20manager%20training%20workshop%20business%20education%20modern%20classroom&image_size=landscape_16_9',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '12 days',
    '杭州培训中心',
    40,
    38,
    899,
    'completed',
    '教育',
    ARRAY['产品', '管理', '培训'],
    (SELECT id FROM auth.users LIMIT 1),
    true
);

-- 插入一些示例报名数据
INSERT INTO activity_registrations (
    id,
    activity_id,
    user_id,
    registration_date,
    status,
    notes
)
SELECT 
    gen_random_uuid(),
    a.id,
    u.id,
    NOW() - INTERVAL '5 days',
    'registered',
    '期待参与这个活动'
FROM activities a
CROSS JOIN (SELECT id FROM auth.users LIMIT 3) u
WHERE a.status IN ('preparing', 'ongoing')
LIMIT 10;

-- 确保权限正确设置
GRANT SELECT ON activities TO anon;
GRANT ALL PRIVILEGES ON activities TO authenticated;
GRANT SELECT ON activity_registrations TO anon;
GRANT ALL PRIVILEGES ON activity_registrations TO authenticated;