_&---------------------------------------------------------------------_
_& Include SAPMZC103SD0003TOP - Module Pool SAPMZC103SD0003
_&---------------------------------------------------------------------\*
PROGRAM sapmzc103sd0003 MESSAGE-ID zmsgc103.

---

- TABLES

---

\*TABLES

---

- Macro

---

DEFINE \_init.
REFRESH &1.
CLEAR &1.
END-OF-DEFINITION.

---

- Internal table and work area

---

DATA : BEGIN OF gs_body.
INCLUDE STRUCTURE zc103sdt0001.
DATA : countrytext TYPE string,
bptypename TYPE string,
modi_yn(1),
style TYPE lvc_t_styl,
grade TYPE zc103sdt0016-grade,
current_score TYPE zc103sdt0016-current_score,
last_eval_date TYPE zc103sdt0016-last_eval_date,
acc_delay_days TYPE zc103sdt0016-acc_delay_days,
blocked_flag TYPE zc103sdt0016-blocked_flag,
limit_amt_year TYPE zc103sdt0016-limit_amt_year,
used_amt_year TYPE zc103sdt0016-used_amt_year,
eval_year TYPE zc103sdt0016-eval_year,
currency TYPE zc103sdt0016-currency,
dunning_date TYPE zc103sdt0016-dunning_date,
END OF gs_body,
gt_body LIKE TABLE OF gs_body,
gt_display LIKE TABLE OF gs_body,
gs_display LIKE gs_body.

\*-- For tree
DATA : BEGIN OF gs_tree,
bpid TYPE zc103sdt0001-bpid,
bpname TYPE zc103sdt0001-bpname,
bptype TYPE zc103sdt0001-bptype,
END OF gs_tree,
gt_tree LIKE TABLE OF gs_tree,
BEGIN OF gs_bptype,
bptype TYPE zc103sdt0001-bptype,
bptypename TYPE string,
END OF gs_bptype,
gt_bptype LIKE TABLE OF gs_bptype.

\*-- For Domain value table (Sencondary Key table)
DATA : BEGIN OF gs_dd07v,
domvalue_l TYPE domvalue_l,
ddtext TYPE val_text,
END OF gs_dd07v,
gt_dd07v LIKE TABLE OF gs_dd07v WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l.

\*-- For Exclude
DATA : gt_ui_functions TYPE ui_functions.

\*-- For Save
DATA : gt_save TYPE TABLE OF zc103sdt0001,
gs_save TYPE zc103sdt0001,
gt_save2 TYPE TABLE OF zc103sdt0016,
gs_save2 TYPE zc103sdt0016.

\*-- For Delete
DATA : gs_delete TYPE zc103sdt0001, " BP 마스터 테이블
gt_delete LIKE TABLE OF gs_delete,
gs_delete2 TYPE zc103sdt0016, " 여신 관리 테이블
gt_delete2 LIKE TABLE OF gs_delete2.

\*-- For F4 Function
DATA : BEGIN OF gs_bpf4,
bpname TYPE zc103sdt0001-bpname,
bpid TYPE zc103sdt0001-bpid,
END OF gs_bpf4,
gt_bpf4 LIKE TABLE OF gs_bpf4.

\*-- For 여신관리테이블-LIMIT_AMT_YEAR
DATA : gt_grade TYPE TABLE OF zc103sdt0029.

---

- Declaration area for NODE

---

TYPES: node_table_type LIKE STANDARD TABLE OF mtreesnode
WITH DEFAULT KEY.
DATA: node_table TYPE node_table_type.

---

- Class Instance

---

DATA : go_container TYPE REF TO cl_gui_custom_container,
go_split_cont TYPE REF TO cl_gui_splitter_container,
go_left_cont TYPE REF TO cl_gui_container,
go_right_cont TYPE REF TO cl_gui_container,

       go_tree_grid  TYPE REF TO cl_gui_alv_grid,
       go_alv_grid   TYPE REF TO cl_gui_alv_grid,
       go_tree       TYPE REF TO cl_gui_simple_tree.

\*-- For ALV
DATA : gt_fcat TYPE lvc_t_fcat,
gs_fcat TYPE lvc_s_fcat,
gs_layout TYPE lvc_s_layo,
gs_variant TYPE disvariant.

---

- Declaration area for Tree event

---

DATA: events TYPE cntl_simple_events,
event TYPE cntl_simple_event.

---

- Screen Field

---

DATA : gv_id TYPE zc103sdt0001-bpid,
gv_name TYPE zc103sdt0001-bpname.

\*-- User command variable
DATA : gv_okcode TYPE sy-ucomm,
gv_editmode TYPE i, " 0: read 1: edit
gv_modified VALUE 'N', " 수정 여부 YN
gv_searched VALUE 'N'. " 검색 여부 YN
