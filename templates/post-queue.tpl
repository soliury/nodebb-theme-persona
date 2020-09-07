<!-- IMPORT partials/breadcrumbs.tpl -->

<div class="row">
	<div class="col-xs-12">
		<div class="post-queue panel panel-primary preventSlideout">
			<div class="panel-heading">
				[[post-queue:post-queue]]
			</div>

			<!-- IF !posts.length -->
			<p class="panel-body">
				[[post-queue:description, {config.relative_path}/admin/settings/post#post-queue]]
			</p>
			<!-- ENDIF !posts.length -->

			<div class="table-responsive">
				<table class="table table-striped posts-list">
					<thead>
						<tr>
							<th>[[post-queue:user]]</th>
							<th>[[post-queue:category]] <i class="fa fa-info-circle" data-toggle="tooltip" title="[[post-queue:content-editable]]"></i></th>
							<th>[[post-queue:title]] <i class="fa fa-info-circle" data-toggle="tooltip" title="[[post-queue:content-editable]]"></i></th>
							<th>[[post-queue:content]] <i class="fa fa-info-circle" data-toggle="tooltip" title="[[post-queue:content-editable]]"></i></th>
							<th>[[post-queue:posted]]</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<!-- BEGIN posts -->
						<tr data-id="{posts.id}">
							<td class="col-md-1">
								<!-- IF posts.user.userslug -->
								<a href="{config.relative_path}/uid/{posts.user.uid}">{posts.user.username}</a>
								<!-- ELSE -->
								{posts.user.username}
								<!-- ENDIF posts.user.userslug -->
							</td>
							<td class="col-md-2 topic-category" {{{if posts.data.cid}}}data-editable="editable"{{{end}}}">
								<a href="{config.relative_path}/category/{posts.category.slug}"><!-- IF posts.category.icon --><span class="fa-stack"><i style="color: {posts.category.bgColor};" class="fa fa-circle fa-stack-2x"></i><i style="color: {posts.category.color};" class="fa fa-stack-1x fa-fw {posts.category.icon}"></i></span><!-- ENDIF posts.category.icon --> {posts.category.name}</a>
							</td>
							<td class="col-md-2 topic-title">
								<!-- IF posts.data.tid -->
								<a href="{config.relative_path}/topic/{posts.data.tid}">[[post-queue:reply-to, {posts.topic.title}]]</a>
								<!-- ENDIF posts.data.tid -->
								{posts.data.title}
							</td>
							{{{if !posts.data.tid}}}
							<td class="col-md-2 topic-title-editable hidden">
								<input class="form-control" type="text" value="{posts.data.title}"/>
							</td>
							{{{end}}}
							<td class="col-md-5 post-content">{posts.data.content}</td>
							<td class="col-md-5 post-content-editable hidden">
								<textarea class="form-control">{posts.data.rawContent}</textarea>
							</td>
							<td class="col-md-1">
								<span class="timeago" title={posts.data.timestampISO}></span>
							</td>
							<td class="col-md-1">
								<div class="btn-group pull-right">
									<button class="btn btn-success btn-xs" data-action="accept"><i class="fa fa-check"></i></button>
									<button class="btn btn-danger btn-xs" data-action="reject"><i class="fa fa-times"></i></button>
								</div>
							</td>
						</tr>
						<!-- END posts -->
					</tbody>
				</table>
			</div>

			<!-- IMPORT partials/paginator.tpl -->
		</div>
	</div>
</div>