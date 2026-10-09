import {zql} from './generated/zero/schema';

zql.User.whereExists('profile', profile => profile.where('userId', 'user-id'), {
  scalar: true,
});

zql.Worker.whereExists(
  'skills',
  workerSkill =>
    workerSkill.where('workerId', 'worker-id').where('skillId', 'skill-id'),
  {scalar: true},
);

// @ts-expect-error A scalar compound-key subquery must constrain every key column.
zql.Worker.whereExists(
  'skills',
  workerSkill => workerSkill.where('workerId', 'worker-id'),
  {scalar: true},
);

// @ts-expect-error A scalar subquery cannot be constrained only by a non-unique column.
zql.User.whereExists('posts', post => post.where('title', 'title'), {
  scalar: true,
});
