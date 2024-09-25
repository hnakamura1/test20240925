/* eslint no-underscore-dangle: 0 */
/* eslint curly: 0 */
/* eslint no-use-before-define: 0 */
/* eslint-disable no-console */

jQuery.noConflict();
(function($) {
    "use strict";
    var $ = jQuery;
    // IDタグ
    const ID_TAG = 'id';
    // クラスタグ
    const CLASS_TAG = 'class';
    // 対象要素タグ
    const TARGET_ELEMENTS_TAG = '.control-gaia';
    // フィールドプレフィックスタグ
    const FIELD_PREFIX_TAG = 'field-';

    function countTitle() {
        $(function() {
            // この部分が対象となる仮データー.
            // 他の画面で設定された内容を元に下記のデータを作成する FieldName, 項目長とする
            var _targetList = [];
            _targetList.push(new item('内容及び理由【４００字以内で記載願います】', 400, 'textarea'));
            _targetList.push(new item('理由詳細①', 1000, 'textarea'));
            _targetList.push(new item('理由詳細②', 1000, 'textarea'));
            _targetList.push(new item('理由詳細③', 1000, 'textarea'));
            function handler() {
                var _fieldMap = createFieldMap(_targetList);
                execute4Event(event, _fieldMap);
            }
            handler();
        });
    }
    /**
     * フィードを作成する
     * @param targetList 対象リスト
     */
    function createFieldMap(targetList) {
        var _fieldMap = {};
        // 1.対象のフィールドの値を設定
        $.each(targetList, function(index, value) {
            _fieldMap[value.name] = value;
        });
        // 2.フィールドを取得
        if ($(TARGET_ELEMENTS_TAG).length > 0) {
            $(TARGET_ELEMENTS_TAG).each(function(index, element) {
                var _tag = $(element).attr(CLASS_TAG);
                var _index = _tag.lastIndexOf(FIELD_PREFIX_TAG);
                // プレフィックスが見つからなかったら、スキップ.
                if (_index === -1) return true;
                _index += FIELD_PREFIX_TAG.length;
                var _code = _tag.substring(_index);
                var _label = $(element).find(getLabelTag(_code));
                var _title = $(_label).text();
                // キーが存在しない場合、スキップ.
                if (!(_title in _fieldMap)) return true;
                var _type = _fieldMap[_title].type;
                var _value = $(element).find(getValueTag(_code, _type));
                _value.attr(ID_TAG, _code);
                _fieldMap[_title].element = {
                    label: _label,
                    value: $(_value).attr(ID_TAG)
                };
                // カウントダウンの場合
                // $(_label).text(_fieldMap[_title].getTitle());
                // カウントアップの場合
                $(_label).text(_fieldMap[_title].getUpTitle());
            });
            return _fieldMap;
        }
    }

    /**
     * ラベルタグを取得する
     * @param code コード
     */
    function getLabelTag(code) {
        return '.label-' + code + ' span';
    }
    /**
     * Valueタグを取得する
     * @param code コード
     * @param type 種類
     */
    function getValueTag(code, type) {
        if (type === 'input') {
            return '.value-' + code + ' input';
        } else if (type === 'textarea') {
            return '.value-' + code + ' textarea';
        }
        return '';
    }

    /**
     * 項目情報
     * @param name 名称
     * @param maxLength 最大項目長
     * @param type 種類
     * @param element 要素
     */
    var item = function(name, maxLength, type, element) {
        this.name = name;
        this.maxLength = maxLength;
        this.type = type;
        this.element = element;
    };
    item.prototype = {
        /**
         * タイトルを取得する
         * @returns タイトル
         */
        getTitle: function() {
            return this.name + '（' + this.getInputLength() + '）';
        },
        /**
         * タイトルを取得する
         * @returns タイトル
         */
        getUpTitle: function() {
            var _length = this.addInputLength();
            if (_length === 0) return this.name;
            return this.name + '（' + _length + '文字' + '）';
        },
        /**
         * 入力長を取得する
         * @returns 入力長
         */
        getInputLength: function() {
            var _length = this.maxLength;
            if (this.element !== null) {
                _length -= $('#' + this.element.value).val().length;
            }
            return _length;
        },
        addInputLength: function() {
            if (this.element !== null) return $('#' + this.element.value).val().length;
        },
        forceSubstring: function() {
            var _force_value = $('#' + this.element.value).val().substring(0, this.maxLength);
            $('#' + this.element.value).val(_force_value);
        }
    };

    /**
     * イベントを実行する
     * @param event イベント
     * @param fieldList フィールドリスト
     */
    function execute4Event(event, fieldMap) {
        $.each(fieldMap, function(key, item) {
            $('#' + item.element.value).bind('keyup', function(textEvent) {
                // カウントダウンの場合
                // $(value.element.label).text(value.getTitle());
                if (item.getInputLength() < 0) {
                    // この制御に関しては、現行を元にそのままにしている
                    alert(item.name + 'は項目長を超えました.');
                    item.forceSubstring();
                }
                $(item.element.label).text(item.getUpTitle());
            });
        });
    }
    /**
     * パラメーターデバッグ
     * @param event イベント
     * @param fieldList フィールドリスト
     */
    function debugParam(event, fieldMap) {
        $.each(fieldMap, function(key, value) {
            console.log(value.name);
            console.log(value.maxLength);
        });
        console.log(event);
    }

    kintone.events.on([
        'app.record.create.show',
        'app.record.edit.show'
    ], function(event) {
        countTitle();
        return event;
    });

})(jQuery);
